import lessonPlanning from './LessonPlanning';

const maxHours = 8;
const planPreset = () => [[], [], [], [], []];

class TimetableGenerator {
  constructor(schoolId) {
    const school = lessonPlanning[schoolId];
    this.schoolId = lessonPlanning[schoolId];
    this.classes = school.classes;
    this.teachers = school.teachers;

    // create plan arrays for classes and teachers
    [
      ...Object.keys(this.classes),
      ...Object.keys(this.teachers),
    ].forEach((key) => {
      this[key] = planPreset();
    });
  }

  /**
   * Transforms the classes and all lessons + teachers into a flat structure.
   *
   * @return     {Array}  The flat.
   */
  getFlat() {
    const flat = [];
    Object.keys(this.classes).forEach((classId) => {
      const classDef = this.classes[classId];
      const lessonKeys = Object.keys(classDef.lessons);

      lessonKeys.forEach((lessonId) => {
        const lesson = classDef.lessons[lessonId];

        /* eslint-disable no-plusplus */
        for (let i = 0; i < lesson.hours; i++) {
          flat.push({
            classId,
            lessonId,
            className: classDef.name,
            lessonName: lesson.name,
            lessons: lesson.lessons,
            teachers: lesson.teachers,
          });
        }
      });
    });

    return flat;
  }

  /**
   * Create a new timetable for a school configuration.
   */
  generate() {
    const flatted = this.getFlat();
    flatted.forEach((lesson) => {
      const { classId, teachers } = lesson;
      const classPlan = this[classId];

      // sort days by amount of hours
      const sortedDays = [].concat(classPlan).sort((a, b) => a.length - b.length);

      // iterate through all sorted days and hours (sortedDayIndex is only used for iterating days
      // with the most less hours)
      let sortedDayIndex = 0;
      let dayIndex;
      let hourIndex = 0;

      // search for available gaps
      let found;
      while (!found) {
        dayIndex = classPlan.indexOf(sortedDays[sortedDayIndex]);
        // get original day index, so the correct order will be used
        const day = sortedDays[dayIndex];

        console.log(`Checking : ${dayIndex} - ${hourIndex}`);
        if (day.length >= maxHours) {
          throw new Error('Toooo many hours');
        }

        let isValid = true;
        // is their a gap in the class plan?
        if (classPlan[dayIndex][hourIndex]) {
          isValid = false;
        // check if teachers have time at this day
        } else {
          // check if teachers have time
          /* eslint-disable no-loop-func */
          teachers.forEach((teacherId) => {
            const teacherConfig = this.teachers[teacherId];
            const teacherPlan = this[teacherId][dayIndex];

            // check teacher config, if the teacher is in the house at this time
            if (teacherConfig.days[dayIndex].indexOf(hourIndex + 1) === -1) {
              isValid = false;
            // check if teacher is already planned at this time
            } else if (teacherPlan[hourIndex]) {
              isValid = false;
            }
          });
        }

        if (isValid) {
          // break loop if possible day was found
          found = true;
        } else {
          // increase last day index, so the next day in week will be proved
          sortedDayIndex++;
          if (sortedDayIndex === 5) {
            if (hourIndex === maxHours) {
              throw new Error('No slot found!');
            }

            sortedDayIndex = 0;
            hourIndex++;
          }
        }
      }

      if (sortedDayIndex >= 6) {
        throw new Error('Toooo many days');
      }

      // apply the lesson to the class plan
      classPlan[dayIndex][hourIndex] = lesson;
      // also assign to teachers plan
      teachers.forEach((teacherId) => {
        this[teacherId][dayIndex][hourIndex] = lesson;
      });
    });

    // create plan arrays for classes and teachers
    const classPlans = [];
    Object.keys(this.classes).forEach((classId) => {
      classPlans.push({
        name: this.classes[classId].name,
        plan: this[classId],
      });
    });

    const teacherPlans = [];
    Object.keys(this.teachers).forEach((teacherId) => {
      teacherPlans.push({
        name: this.teachers[teacherId].name,
        plan: this[teacherId],
      });
    });

    return {
      classes: classPlans,
      teachers: teacherPlans,
    };
  }
}

export default TimetableGenerator;
