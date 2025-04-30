document.addEventListener('DOMContentLoaded', function () {

  // SEMESTER TAB TOGGLE
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      tabContents.forEach(content => {
        content.classList.remove('active');
      });

      const targetTab = document.getElementById(button.dataset.tab);
      if (targetTab) targetTab.classList.add('active');
    });
  });

  // FUNCTION TO CREATE COURSE FIELD
  function addCourseField(semesterId, container) {
    const course = document.createElement('div');
    course.className = 'course';

    course.innerHTML = `
      <label>Course Code</label>
      <input type="text" placeholder="E.g. MTH101">
      <label>Course Title</label>
      <input type="text" placeholder="Enter title">
      <label>Units</label>
      <select>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <label>Score (%)</label>
      <input type="number" min="0" max="100" placeholder="E.g. 85">
      <button class="remove-btn">Remove</button>
    `;

    container.appendChild(course);

    course.querySelector('.remove-btn').addEventListener('click', () => {
      container.removeChild(course);
    });
  }

  // ADD DEFAULT 3 COURSES ON PAGE LOAD
  function createDefaultCourses() {
    for (let i = 1; i <= 2; i++) {
      const container = document.getElementById(`courses${i}`);
      for (let j = 0; j < 3; j++) {
        addCourseField(i, container);
      }
    }
  }

  createDefaultCourses();

  // DYNAMICALLY ADD COURSE
  document.getElementById('add-course1').addEventListener('click', () => {
    const container = document.getElementById('courses1');
    addCourseField(1, container);
  });

  document.getElementById('add-course2').addEventListener('click', () => {
    const container = document.getElementById('courses2');
    addCourseField(2, container);
  });

  // GPA CALCULATION LOGIC
  document.getElementById('calculate-gpa').addEventListener('click', () => {
    const resultsDiv = document.getElementById('results');

    const sem1Data = getCourseData('courses1');
    const sem2Data = getCourseData('courses2');

    const gpa1 = calculateGPA(sem1Data);
    const gpa2 = calculateGPA(sem2Data);

    const totalCredits = (sem1Data.reduce((sum, c) => sum + c.units, 0) || 0)
                      + (sem2Data.reduce((sum, c) => sum + c.units, 0) || 0);

    const totalPoints = (sem1Data.reduce((sum, c) => sum + (c.gradePoint * c.units), 0) || 0)
                      + (sem2Data.reduce((sum, c) => sum + (c.gradePoint * c.units), 0) || 0);

    const cgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;

    resultsDiv.innerHTML = `
      <h2>Results</h2>
      <p>Semester 1 GPA: ${gpa1}</p>
      <p>Semester 2 GPA: ${gpa2}</p>
      <p>CGPA: ${cgpa}</p>
      <p style="margin-top:15px;"><strong>${getClassification(cgpa)}</strong></p>
    `;
  });

  // FETCH DATA FROM COURSE FIELDS
  function getCourseData(containerId) {
    const container = document.getElementById(containerId);
    const courses = container.querySelectorAll('.course');
    const result = [];

    courses.forEach(course => {
      const codeInput = course.querySelector('input:nth-of-type(1)');
      const titleInput = course.querySelector('input:nth-of-type(2)');
      const unitsSelect = course.querySelector('select');
      const scoreInput = course.querySelector('input[type="number"]');

      const code = codeInput ? codeInput.value.trim() : '';
      const title = titleInput ? titleInput.value.trim() : '';
      const units = unitsSelect ? parseInt(unitsSelect.value) : NaN;
      const score = scoreInput ? parseInt(scoreInput.value) : NaN;

      if (code && title && !isNaN(units) && !isNaN(score)) {
        result.push({
          code,
          title,
          units,
          score,
          gradePoint: convertScoreToGradePoint(score),
        });
      }
    });

    return result;
  }

  // CONVERT SCORE TO GRADE POINT
  function convertScoreToGradePoint(score) {
    if (score >= 80) return 5;
    if (score >= 70) return 4;
    if (score >= 60) return 3;
    if (score >= 50) return 2;
    if (score >= 40) return 1;
    return 0;
  }

  // CALCULATE GPA FOR ONE SEMESTER
  function calculateGPA(data) {
    if (!data.length) return 'N/A';
    const credits = data.reduce((a, b) => a + b.units, 0);
    const points = data.reduce((a, b) => a + (b.gradePoint * b.units), 0);
    return (points / credits).toFixed(2);
  }

  // CLASSIFY CGPA
  function getClassification(cgpa) {
    cgpa = parseFloat(cgpa);
    if (cgpa >= 4.5) return "🏆 Congratulations! You are a First Class student.";
    if (cgpa >= 3.5) return "🎓 Second Class Upper";
    if (cgpa >= 2.5) return "📘 Second Class Lower";
    if (cgpa >= 2.0) return "📘 Third Class";
    return "⛔ Sorry, you have failed.";
  }
});