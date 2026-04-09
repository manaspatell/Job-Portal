const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

// College tier rating map (example, adjust as needed)
const COLLEGE_TIER_RATING = {
  'tier 1': 2.5,
  'tier 2': 1.5,
  'tier 3': 0.5
};

// Returns a score out of 5 based on college tier and skill match
async function calculateApplicantRating({ collegeTier, skills, cvPath }) {
  let rating = 0;

  // 1. College tier rating
  if (collegeTier && COLLEGE_TIER_RATING[collegeTier.toLowerCase()]) {
    rating += COLLEGE_TIER_RATING[collegeTier.toLowerCase()];
  }

  // 2. Skill match (compare skills string to CV text if available)
  let skillScore = 0;
  if (skills) {
    let cvText = '';
    if (cvPath && fs.existsSync(cvPath)) {
      const ext = path.extname(cvPath).toLowerCase();
      if (ext === '.pdf') {
        try {
          const dataBuffer = fs.readFileSync(cvPath);
          const pdfData = await pdfParse(dataBuffer);
          cvText = pdfData.text;
        } catch (e) { cvText = ''; }
      } else if (ext === '.txt') {
        try {
          cvText = fs.readFileSync(cvPath, 'utf8');
        } catch (e) { cvText = ''; }
      }
    }
    const skillList = skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    let matched = 0;
    for (const skill of skillList) {
      if (cvText.toLowerCase().includes(skill)) matched++;
    }
    if (skillList.length > 0) {
      skillScore = (matched / skillList.length) * 2.5; // up to 2.5 points
    }
  }
  rating += skillScore;
  if (rating > 5) rating = 5;
  return Math.round(rating * 10) / 10; // 1 decimal place
}

module.exports = { calculateApplicantRating };
