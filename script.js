document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Tab switching logic
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      tabContents.forEach(content => {
        content.classList.remove('active');
      });

      const targetTab = document.getElementById(button.dataset.tab);
      targetTab.classList.add('active');
    });
  });

  // Function to add course field
  function addCourseField(semesterId, coursesDiv) {
    const count = coursesDiv.childElementCount;

    const course = document.createElement('div');
    course.className = 'course';
    course.innerHTML = `
      <label>Course Code</label>
      <input type="text" placeholder="E.g. MTH101" required>
      <label>Course Title</label>
      <input type="text" placeholder="Enter title" required>
      <label>Units</label>
      <select required>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <label>Score (%)</label>
      <input type="number" min="0" max="100" placeholder="E.g. 85" required>
      <button class="remove-btn">Remove</button>
    `;

    coursesDiv.appendChild(course);

    // Remove button functionality
    course.querySelector('.remove-btn').addEventListener('click', () => {
      coursesDiv.removeChild(course);
    });
  }

  // Initialize default 3 courses per semester
  function createDefaultCourses() {
    for (let i = 1; i <= 2; i++) {
      const coursesDiv = document.getElementById(`courses${i}`);
      for (let j = 0; j < 3; j++) {
        addCourseField(i, coursesDiv);
      }
    }
  }

  createDefaultCourses();

  // Dynamic course adding
  document.querySelectorAll('[id^="add-course"]').forEach(button => {
    button.addEventListener('click', () => {
      const semesterId = button.id.replace('add-course', '');
      const coursesDiv = document.getElementById(`courses${semesterId}`);
      addCourseField(semesterId, coursesDiv);
    });
  });

  // GPA Calculation Logic
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
      <p style="margin-top:15px;">${getClassification(cgpa)}</p>
    `;
  });

  function getCourseData(id) {
    const container = document.getElementById(id);
    return Array.from(container.children).map(div => {
      const code = div.querySelector('input:nth-of-type(1)').value.trim();
      const title = div.querySelector('input:nth-of-type(2)').value.trim();
      const units = parseInt(div.querySelector('select').value);
      const score = parseInt(div.querySelector('input[type="number"]').value);

      return {
        code, title, units, score,
        gradePoint: convertScore(score),
      };
    }).filter(course => course.code && course.title && !isNaN(units) && !isNaN(score));
  }

  function convertScore(score) {
    if (score >= 80) return 5;
    if (score >= 70) return 4;
    if (score >= 60) return 3;
    if (score >= 50) return 2;
    if (score >= 40) return 1;
    return 0;
  }

  function calculateGPA(data) {
    if (!data.length) return 'N/A';
    const credits = data.reduce((a, b) => a + b.units, 0);
    const points = data.reduce((a, b) => a + (b.gradePoint * b.units), 0);
    return (points / credits).toFixed(2);
  }

  function getClassification(cgpa) {
    cgpa = parseFloat(cgpa);
    if (cgpa >= 4.5) return "🏆 Congratulations! You are a First Class student.";
    if (cgpa >= 3.5) return "🎓 Second Class Upper";
    if (cgpa >= 2.5) return "📘 Second Class Lower";
    if (cgpa >= 2.0) return "📘 Third Class";
    return "⛔ Sorry, you have failed.";
  }
});