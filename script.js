document.addEventListener('DOMContentLoaded', () => {
    const semesterTabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const addCourseButtons = document.querySelectorAll('#add-course1, #add-course2');
    const calculateGPAButton = document.getElementById('calculate-gpa');
    const resultsDiv = document.getElementById('results');

    // Initialize course lists
    const courses1 = [];
    const courses2 = [];

    // Tab switching functionality
    semesterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = document.querySelector(`#${tab.dataset.tab}`);
            tabContents.forEach(content => content.classList.remove('active'));
            targetTab.classList.add('active');
        });
    });

    // Add course functionality
    addCourseButtons.forEach(button => {
        button.addEventListener('click', () => {
            const semesterId = button.id.replace('add-course', '');
            const coursesDiv = document.getElementById(`courses${semesterId}`);
            const courseCount = coursesDiv.childElementCount;

            const course = document.createElement('div');
            course.className = 'course';
            course.innerHTML = `
                <label for="course-code-${courseCount}">Course Code</label>
                <input type="text" id="course-code-${courseCount}" placeholder="Enter Course Code">
                <label for="course-title-${courseCount}">Course Title</label>
                <input type="text" id="course-title-${courseCount}" placeholder="Enter Course Title">
                <label for="course-units-${courseCount}">Units</label>
                <select id="course-units-${courseCount}">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                </select>
                <label for="course-score-${courseCount}">Score</label>
                <input type="number" id="course-score-${courseCount}" placeholder="Enter Score">
                <button class="remove-btn">Remove</button>
            `;

            coursesDiv.appendChild(course);

            // Remove course functionality
            course.querySelector('.remove-btn').addEventListener('click', () => {
                coursesDiv.removeChild(course);
            });
        });
    });

    // Calculate GPA functionality
    calculateGPAButton.addEventListener('click', () => {
        const semester1Courses = getCourseData('courses1');
        const semester2Courses = getCourseData('courses2');

        const semester1GPA = calculateGPA(semester1Courses);
        const semester2GPA = calculateGPA(semester2Courses);

        const totalCredits = semester1Courses.reduce((sum, course) => sum + course.units, 0) +
                             semester2Courses.reduce((sum, course) => sum + course.units, 0);

        const totalGradePoints = semester1Courses.reduce((sum, course) => sum + (course.gradePoint * course.units), 0) +
                                 semester2Courses.reduce((sum, course) => sum + (course.gradePoint * course.units), 0);

        const CGPA = totalGradePoints / totalCredits;

        displayResults(semester1GPA, semester2GPA, CGPA, semester1Courses, semester2Courses);
    });

    function getCourseData(coursesId) {
        const coursesDiv = document.getElementById(coursesId);
        const courses = [];

        Array.from(coursesDiv.children).forEach(course => {
            const code = course.querySelector('input[id^="course-code"]').value;
            const title = course.querySelector('input[id^="course-title"]').value;
            const units = parseInt(course.querySelector('select[id^="course-units"]').value);
            const score = parseInt(course.querySelector('input[id^="course-score"]').value);

            if (code && title && !isNaN(units) && !isNaN(score)) {
                const gradePoint = convertScoreToGradePoint(score);
                courses.push({ code, title, units, score, gradePoint });
            }
        });

        return courses;
    }

    function convertScoreToGradePoint(score) {
        if (score >= 80) return 5.0;
        if (score >= 70) return 4.0;
        if (score >= 60) return 3.0;
        if (score >= 50) return 2.0;
        if (score >= 40) return 1.0;
        return 0.0;
    }

    function calculateGPA(courses) {
        if (courses.length === 0) return 0.0;

        const totalUnits = courses.reduce((sum, course) => sum + course.units, 0);
        const totalGradePoints = courses.reduce((sum, course) => sum + (course.gradePoint * course.units), 0);

        return parseFloat((totalGradePoints / totalUnits).toFixed(2));
    }

    function displayResults(semester1GPA, semester2GPA, CGPA, semester1Courses, semester2Courses) {
        resultsDiv.innerHTML = `
            <h2>Results</h2>
            <p>Semester 1 GPA: ${semester1GPA}</p>
            <p>Semester 2 GPA: ${semester2GPA}</p>
            <p>CGPA: ${CGPA}</p>
            
            <h3>Classification</h3>
            <div class="classification">
                ${getClassification(CGPA)}
            </div>
            
            <h3>Course Breakdown</h3>
            <table>
                <thead>
                    <tr>
                        <th>Semester</th>
                        <th>Course Code</th>
                        <th>Course Title</th>
                        <th>Units</th>
                        <th>Score</th>
                        <th>Grade Point</th>
                    </tr>
                </thead>
                <tbody>
                    ${getCourseBreakdownRows(semester1Courses, 1)}
                    ${getCourseBreakdownRows(semester2Courses, 2)}
                </tbody>
            </table>
        `;

        // Scroll to results section
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }

    function getCourseBreakdownRows(courses, semester) {
        let rows = '';
        courses.forEach((course, index) => {
            rows += `
                <tr>
                    <td>${semester}</td>
                    <td>${course.code}</td>
                    <td>${course.title}</td>
                    <td>${course.units}</td>
                    <td>${course.score}</td>
                    <td>${course.gradePoint}</td>
                </tr>
            `;
        });
        return rows;
    }

    function getClassification(CGPA) {
        if (CGPA >= 4.5) return "Congratulations! You are a First Class student.";
        if (CGPA >= 3.5) return "Congratulations! You are a Second Class Upper student.";
        if (CGPA >= 2.5) return "Congratulations! You are a Second Class Lower student.";
        if (CGPA >= 2.0) return "Congratulations! You are a Third Class student.";
        return "Sorry, you have failed.";
    }
});