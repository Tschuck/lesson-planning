import { cloneDeep } from 'lodash';

import lessonPlanning from './LessonPlanning';

const maxHours = 8;
const planPreset = () => [[], [], [], [], []];

class TimetableGenerator {
  constructor(schoolId) {
    const school = lessonPlanning[schoolId];
    this.blocked = { };
    this.classes = school.classes;
    this.schoolId = schoolId;
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
   * Creates a new instance of the object with same properties than original (but with new object
   * references.
   */
  clone() {
    const clone = new TimetableGenerator(this.schoolId);

    Object.keys(this).forEach((key) => {
      clone[key] = cloneDeep(this[key]);
    });

    return clone;
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
    const beforeLength = flatted.length;

    while (flatted.length) {
      console.log(`processing flatted ${flatted.length} / ${beforeLength}`);
      console.log(`  - classId:  ${flatted[0].classId}`);
      console.log(`  - lessonId: ${flatted[0].lessonId}`);
      const lessonShifts = this.getLessonShifts(flatted[0]);
      console.dir(lessonShifts);
      lessonShifts.forEach(({ foundSlot, lesson }) => {
        // assign the lesson to the time slot and remove it from the flatted array
        this.assignLesson(lesson, foundSlot);
      });
      // remove the first element, was already inserted
      flatted.shift();
    }

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

  /**
   * Return a array of lesson and slots that should be shifted / reassigned.
   *
   * @param      {any}  lesson     lesson object
   * @param      {Array}   [todos=[{foundSlot, lesson}]  ]  The todos
   * @return     {Array}   todos
   */
  getLessonShifts(lesson, todos = []) {
    let foundSlot = this.getFreeLessonSlot(lesson);

    if (foundSlot) {
      todos.push({ foundSlot, lesson });
    } else {
      // iterate through all classes and try to shift lessons
      const classIds = Object.keys(this.classes);
      for (let i = 0; i < classIds.length; i += 1) {
        const classId = classIds[i];

        for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
          for (let hourIndex = 0; hourIndex < maxHours; hourIndex += 1) {
            // only try to use this block, if it wasnt blocked before by the recursion
            if (!this.isSlotBlocked(classId, dayIndex, hourIndex)) {
              // if a assigned lesson was found, check if the passed lesson could fit
              const revertedLesson = this[classId][dayIndex][hourIndex];
              if (revertedLesson) {
                const clone = this.clone();
                clone.revertLesson(revertedLesson, { dayIndex, hourIndex });
                foundSlot = clone.getFreeLessonSlot(lesson);

                if (foundSlot) {
                  // assign the new lesson and block this slot for the clone
                  clone.assignLesson(lesson, foundSlot);
                  clone.setIsBlocked(classId, dayIndex, hourIndex);

                  // search for a new slot for the reverted lessons
                  const cloneShifts = clone.getLessonShifts(
                    revertedLesson,
                    [
                      ...todos,
                      { foundSlot, lesson },
                    ],
                  );
                  if (cloneShifts) {
                    return cloneShifts;
                  }
                }
              }
            }
          }
        }
      }

      // // sort for lowest amount of switches
      // possibleShifts = possibleShifts.sort((a, b) => {
      //   if (a.length > b.length) {
      //     return 1;
      //   } else if (a.length < b.length) {
      //     return -1;
      //   }

      //   return 0;
      // });
      // return possibleShifts[0];
    }

    return todos;
  }

  /**
   * Get a currently avaiable lesson slot. If not slot could be found, return null.
   *
   * @param      {any}  lesson  lesson to apply to the plan
   */
  getFreeLessonSlot(lesson) {
    const { classId, lessonId, teachers } = lesson;
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

      if (day.length >= maxHours) {
        throw new Error('Toooo many hours');
      }

      let isValid = true;
      // is their a gap in the class plan?
      if (this.isSlotBlocked(classId, dayIndex, hourIndex) || classPlan[dayIndex][hourIndex]) {
        isValid = false;
      } else {
        // allow the same lesson only 2 times a day
        /* eslint-disable arrow-parens */
        const lessonCount = classPlan[dayIndex].filter((sub) => sub && sub.lessonId === lessonId).length;
        if (lessonCount > 1) {
          isValid = false;
        // check if teachers have time at this day
        } else {
          // check if teachers have times
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
      }

      if (isValid) {
        // break loop if possible day was found
        found = true;
      } else {
        // increase last day index, so the next day in week will be prooved
        sortedDayIndex++;
        if (sortedDayIndex === 5) {
          if (hourIndex === maxHours) {
            return null;
          }

          sortedDayIndex = 0;
          hourIndex++;
        }
      }
    }

    return { dayIndex, hourIndex };
  }

  /**
   * Assign the lesson to a specific timeslot
   *
   * @param      {any}     lesson          lesson configuration
   * @param      {Object}  arg2            lesson slot
   * @param      {number}  arg2.dayIndex   day of the slot
   * @param      {number}  arg2.hourIndex  hour at this day
   */
  assignLesson(lesson, { dayIndex, hourIndex }) {
    // apply the lesson to the class plan
    this[lesson.classId][dayIndex][hourIndex] = lesson;
    // also assign to teachers plan
    lesson.teachers.forEach((teacherId) => {
      this[teacherId][dayIndex][hourIndex] = lesson;
    });
  }

  /**
   * Remove a lesson from a time slot.
   *
   * @param      {any}     lesson          lesson configuration
   * @param      {Object}  arg2            lesson slot
   * @param      {number}  arg2.dayIndex   day of the slot
   * @param      {number}  arg2.hourIndex  hour at this day
   */
  revertLesson(lesson, { dayIndex, hourIndex }) {
    // apply the lesson to the class plan
    this[lesson.classId][dayIndex][hourIndex] = null;
    // also assign to teachers plan
    lesson.teachers.forEach((teacherId) => {
      this[teacherId][dayIndex][hourIndex] = null;
    });
  }

  /**
   * Block a specific day / hour index for a class, sot getFreeSlot will skip it.
   *
   * @param      {string}  classId    class id to block
   * @param      {number}  dayIndex   day index to block
   * @param      {number}  hourIndex  hour index to block
   */
  setIsBlocked(classId, dayIndex, hourIndex) {
    this.blocked[`${classId}-${dayIndex}-${hourIndex}`] = true;
  }

  /**
   * Check if a specific hour is blocked.
   *
   * @param      {string}   classId    class id to check
   * @param      {number}   dayIndex   day index to check
   * @param      {number}   hourIndex  hour index to check
   * @return     {boolean}  True if slot blocked, False otherwise
   */
  isSlotBlocked(classId, dayIndex, hourIndex) {
    return this.blocked[`${classId}-${dayIndex}-${hourIndex}`];
  }
}

export default TimetableGenerator;
