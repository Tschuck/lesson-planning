import { cloneDeep } from 'lodash';

import lessonPlanning from './LessonPlanning';

const maxHours = 8;
const planPreset = () => [[], [], [], [], []];

class TimetableGenerator {
  constructor(schoolId, preset) {
    // use preset to force a specific set of data
    if (preset) {
      Object.keys(preset).forEach((key) => {
        this[key] = preset[key];
      });
      return;
    }

    this.blocked = { };
    this.schoolId = schoolId;
    this.school = lessonPlanning[schoolId];

    const timetable = this.school.timetable || { };
    // create plan arrays for classes and teachers
    [
      ...Object.keys(this.school.classes),
      ...Object.keys(this.school.teachers),
    ].forEach((key) => {
      this[key] = timetable[key] || planPreset();
    });

    this.updateForConfig();
  }

  /**
   * Creates a new instance of the object with same properties than original (but with new object
   * references.
   */
  clone() {
    return new TimetableGenerator(this.schoolId, JSON.parse(JSON.stringify(this)));
  }

  /**
   * Transforms the classes and all lessons + teachers into a flat structure.
   *
   * @return     {Array}  The flat.
   */
  getFlat() {
    const flat = [];
    Object.keys(this.school.classes).forEach((classId) => {
      const classDef = this.school.classes[classId];
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
  update() {
    this.updateForConfig();

    // use a clone, until all changes were successfull
    const clone = this.clone();
    const flatted = clone.getFlat();

    // reset previous plan one the clone but ignore locked entries
    const classIds = Object.keys(clone.classes);
    for (let classIndex = 0; classIndex < classIds.length; classIndex += 1) {
      const classId = classIds[classIndex];
      for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
        for (let hourIndex = 0; hourIndex < maxHours; hourIndex += 1) {
          const lesson = clone[classId][dayIndex][hourIndex];
          if (lesson) {
            // if lesson was not locked before, remove it
            if (!lesson.locked) {
              clone.revertLesson(clone[classId][dayIndex][hourIndex], { dayIndex, hourIndex });
            } else {
              let found = false;
              // remove it from the flatted array
              for (let i = 0; i < flatted.length; i += 1) {
                if (flatted[i].lessonId === lesson.lessonId) {
                  found = true;
                  flatted.splice(i, 1);
                  break;
                }
              }
              if (!found) {
                throw new Error('This lesson is not avaiable. Always locked!');
              }
            }
          }
        }
      }
    }

    // iterate through all flatted entries and try to resolve them
    while (flatted.length) {
      const lessonShifts = clone.getLessonShifts(flatted[0]);
      lessonShifts.forEach(({ foundSlot, lesson }) => {
        // assign the lesson to the time slot and remove it from the flatted array
        clone.assignLesson(lesson, foundSlot);
      });
      // remove the first element, was already inserted
      flatted.shift();
    }

    // if everything was valid, use it
    Object.keys(this.school.classes).forEach((key) => {
      this[key] = cloneDeep(clone[key]);
    });

    Object.keys(this.school.teachers).forEach((key) => {
      this[key] = cloneDeep(clone[key]);
    });

    this.save();
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
      const classIds = Object.keys(this.school.classes);
      const clone = this.clone();

      for (let i = 0; i < classIds.length; i += 1) {
        const classId = classIds[i];
        for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
          for (let hourIndex = 0; hourIndex < maxHours; hourIndex += 1) {
            // only try to use this block, if it wasnt blocked before by the recursion
            if (!this.isSlotBlocked(classId, dayIndex, hourIndex)) {
              // if a assigned lesson was found, check if the passed lesson could fit
              const revertedLesson = this[classId][dayIndex][hourIndex];
              if (revertedLesson) {
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
                } else {
                  // revert the revert
                  clone.assignLesson(revertedLesson, { dayIndex, hourIndex });
                }
              }
            }
          }
        }
      }
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
        const lessonCount = classPlan[dayIndex].filter((sub) => sub && sub.lessonId === lessonId)
          .length;
        if (lessonCount > 1) {
          isValid = false;
        // check if teachers have time at this day
        } else {
          // check if teachers have times
          /* eslint-disable no-loop-func */
          teachers.forEach((teacherId) => {
            const teacherConfig = this.school.teachers[teacherId];
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
    if (this[lesson.classId][dayIndex][hourIndex]) {
      this.revertLesson(this[lesson.classId][dayIndex][hourIndex], { dayIndex, hourIndex });
    }

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
   * Create a new object without class reference to save it within the lesson as json export.
   */
  serialize() {
    const clone = { };

    Object.keys(this.school.classes).forEach((key) => {
      clone[key] = cloneDeep(this[key]);
    });

    Object.keys(this.school.teachers).forEach((key) => {
      clone[key] = cloneDeep(this[key]);
    });

    return clone;
  }

  /**
   * Save the current configuration to the school.
   */
  save() {
    lessonPlanning.setTimetable(this.schoolId, this.serialize());
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
    return (this[classId][dayIndex][hourIndex] && this[classId][dayIndex][hourIndex].locked)
      || this.blocked[`${classId}-${dayIndex}-${hourIndex}`];
  }

  /**
   * Update all lessons, classes and texts to latest configuration.
   */
  updateForConfig() {
    [
      ...Object.keys(this.school.classes),
      ...Object.keys(this.school.teachers),
    ].forEach((key) => {
      // apply latest texts and specifications from user configuration
      for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
        for (let hourIndex = 0; hourIndex < maxHours; hourIndex += 1) {
          const lesson = this[key][dayIndex][hourIndex];
          if (lesson) {
            const classDef = this.school.classes[lesson.classId];
            const orgLesson = classDef.lessons[lesson.lessonId];

            lesson.className = classDef.name;
            lesson.lessonName = orgLesson.name;
            lesson.lessons = orgLesson.lessons;
            lesson.teachers = orgLesson.teachers;
          }
        }
      }
    });
  }
}

export default TimetableGenerator;
