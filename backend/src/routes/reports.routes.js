const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const MedicalReport = require('../models/MedicalReport');

router.use(protect);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const report = await MedicalReport.create({
      user: req.user._id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype.includes('pdf') ? 'pdf' : 'image',
      fileSize: req.file.size,
      analysisStatus: 'processing',
    });
    try {
      const pyRes = await fetch(`${process.env.PYTHON_SERVICE_URL}/analyze/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report._id.toString(), filePath: req.file.path, fileType: report.fileType }),
      });
      if (pyRes.ok) {
        const analysis = await pyRes.json();
        await MedicalReport.findByIdAndUpdate(report._id, {
          summary: analysis.summary,
          keyFindings: analysis.key_findings,
          simplifiedTerms: analysis.simplified_terms,
          questionsForDoctor: analysis.questions_for_doctor,
          rawExtractedText: analysis.raw_text,
          analysisStatus: 'completed',
          analyzedAt: new Date(),
        });
      } else {
        await MedicalReport.findByIdAndUpdate(report._id, { analysisStatus: 'failed' });
      }
    } catch (pyErr) {
      console.error('Python service error:', pyErr.message);
      await MedicalReport.findByIdAndUpdate(report._id, { analysisStatus: 'failed' });
    }
    const updated = await MedicalReport.findById(report._id);
    res.status(201).json({ report: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/', async (req, res) => {
  const reports = await MedicalReport.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ reports });
});

router.delete('/:id', async (req, res) => {
  await MedicalReport.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Report deleted.' });
});

module.exports = router;
