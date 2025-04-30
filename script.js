alert("Just a simple CGPA CALCULATOR, special thanks to Shaz-d-Techbro on this one!")
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
  function addCourseField(semesterId, container, courseData = {}) {
    const course = document.createElement('div');
    course.className = 'course';

    course.innerHTML = `
      <label>Course Code</label>
      <input type="text" placeholder="E.g. MTH101" value="${courseData.code || ''}">
      <label>Course Title</label>
      <input type="text" placeholder="Enter title" value="${courseData.title || ''}">
      <label>Units</label>
      <select>
        <option value="1" ${courseData.units === 1 ? 'selected' : ''}>1</option>
        <option value="2" ${courseData.units === 2 ? 'selected' : ''}>2</option>
        <option value="3" ${courseData.units === 3 ? 'selected' : ''}>3</option>
        <option value="4" ${courseData.units === 4 ? 'selected' : ''}>4</option>
        <option value="5" ${courseData.units === 5 ? 'selected' : ''}>5</option>
      </select>
      <label>Score (%)</label>
      <input type="number" min="0" max="100" placeholder="E.g. 85" value="${courseData.score || ''}">
      <button class="remove-btn">Remove</button>
    `;

    container.appendChild(course);

    // Remove course
    course.querySelector('.remove-btn').addEventListener('click', () => {
      container.removeChild(course);
      saveAllCourses();
    });

    // Save on input
    course.querySelectorAll('input, select').forEach(input => {
      input.addEventListener('change', saveAllCourses);
    });
  }

  // LOAD SAVED DATA OR DEFAULT 3 COURSES
  function initializeCourses() {
    const savedData = loadSavedCourses();

    for (let i = 1; i <= 2; i++) {
      const container = document.getElementById(`courses${i}`);
      const courses = savedData[`semester${i}`] || [];

      if (courses.length > 0) {
        courses.forEach(data => {
          addCourseField(i, container, data);
        });
      } else {
        for (let j = 0; j < 3; j++) {
          addCourseField(i, container);
        }
      }
    }
  }

  // SAVE ALL COURSE DATA TO LOCAL STORAGE
  function saveAllCourses() {
    const allData = {
      semester1: getCourseData('courses1'),
      semester2: getCourseData('courses2')
    };

    localStorage.setItem('cgpaCalculatorData', JSON.stringify(allData));
  }

  // LOAD FROM LOCAL STORAGE
  function loadSavedCourses() {
    const data = localStorage.getItem('cgpaCalculatorData');
    return data ? JSON.parse(data) : { semester1: [], semester2: [] };
  }

  // GET COURSE DATA FOR GPA CALCULATION
  function getCourseData(containerId) {
    const container = document.getElementById(containerId);
    const courses = container.querySelectorAll('.course');
    const result = [];

    courses.forEach(course => {
      const codeInput = course.querySelector('input:nth-of-type(1)');
      const titleInput = course.querySelector('input:nth-of-type(2)');
      const unitsSelect = course.querySelector('select');
      const scoreInput = course.querySelector('input[type="number"]');

      const code = codeInput?.value.trim() || '';
      const title = titleInput?.value.trim() || '';
      const units = parseInt(unitsSelect?.value);
      const score = parseInt(scoreInput?.value);

      if (code && title && !isNaN(units) && !isNaN(score)) {
        const gradePoint = convertScoreToGradePoint(score);
        const weightedPoint = gradePoint * units;

        result.push({
          code,
          title,
          units,
          score,
          gradePoint,
          weightedPoint
        });
      }
    });

    return result;
  }

  // ADD DYNAMIC COURSE AND SAVE
  document.getElementById('add-course1').addEventListener('click', () => {
    const container = document.getElementById('courses1');
    addCourseField(1, container);
    saveAllCourses();
  });

  document.getElementById('add-course2').addEventListener('click', () => {
    const container = document.getElementById('courses2');
    addCourseField(2, container);
    saveAllCourses();
  });

  // INITIALIZE
  initializeCourses();

  // GPA CALCULATION LOGIC
  document.getElementById('calculate-gpa').addEventListener('click', () => {
    const resultsDiv = document.getElementById('results');

    const sem1Data = getCourseData('courses1');
    const sem2Data = getCourseData('courses2');

    const gpa1 = calculateGPA(sem1Data);
    const gpa2 = calculateGPA(sem2Data);

    const totalCredits = (sem1Data.reduce((sum, c) => sum + c.units, 0) || 0)
                      + (sem2Data.reduce((sum, c) => sum + c.units, 0) || 0);

    const totalPoints = (sem1Data.reduce((sum, c) => sum + c.weightedPoint, 0) || 0)
                      + (sem2Data.reduce((sum, c) => sum + c.weightedPoint, 0) || 0);

    const cgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;

    resultsDiv.innerHTML = `
      <h2>Results</h2>
      <p>Semester 1 GPA: ${gpa1}</p>
      <p>Semester 2 GPA: ${gpa2}</p>
      <p>CGPA: ${cgpa}</p>
      <p style="margin-top:15px;"><strong>${getClassification(cgpa)}</strong></p>
    `;
  });

  // CONVERT SCORE TO GRADE POINT (based on your scale)
  function convertScoreToGradePoint(score) {
    if (score >= 70) return 5.0;
    if (score >= 60) return 4.0;
    if (score >= 50) return 3.0;
    if (score >= 40) return 2.0;
    if (score >= 30) return 1.0;
    return 0.0;
  }

  // CALCULATE GPA FOR ONE SEMESTER
  function calculateGPA(data) {
    if (!data.length) return 'N/A';
    const totalUnits = data.reduce((a, b) => a + b.units, 0);
    const totalWeighted = data.reduce((a, b) => a + b.weightedPoint, 0);
    return (totalWeighted / totalUnits).toFixed(2);
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