import { cloneDeep } from 'lodash';

import lessonPlanning from './LessonPlanning';

const maxHours = 8;
const planPreset = () => [[], [], [], [], []];

class TimetableGenerator {
  constructor(schoolId, preset) {
    // use preset to force a specific set of data
    if (preset) {
      Object.keys(preset).forEach((key) => {
        // if it contains a minus, its a generated id and should be copied without reference
        this[key] = JSON.parse(JSON.stringify(preset[key]));
      });
      return;
    }

    this.blocked = { };
    this.schoolId = schoolId;
    this.school = lessonPlanning[schoolId];

    const timetable = this.school.timetable || { };
    // create plan arrays for classes
    Object.keys(this.school.classes).forEach((key) => {
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
        const planLesson = this.getPlanLesson(lessonId, classId);

        /* eslint-disable no-plusplus */
        while (flat.filter(entry => entry.id === planLesson.id).length < lesson.hours) {
          flat.push({ ...planLesson });
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
    const beforeLength = flatted.length;

    // reset previous plan one the clone but ignore locked entries
    const classIds = Object.keys(this.school.classes);
    for (let classIndex = 0; classIndex < classIds.length; classIndex += 1) {
      const classId = classIds[classIndex];
      for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
        for (let hourIndex = 0; hourIndex < maxHours; hourIndex += 1) {
          const lesson = clone[classId][dayIndex][hourIndex];
          if (lesson) {
            // if lesson was not locked before, remove it
            if (!lesson.locked) {
              clone.revertLesson(lesson.id, { dayIndex, hourIndex });
            } else {
              let found = false;
              // remove it from the flatted array
              for (let i = 0; i < flatted.length; i += 1) {
                if (flatted[i].id === lesson.id) {
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
      console.log(`processing flatted ${flatted.length} / ${beforeLength}`);
      console.log(`  - lessonId: ${flatted[0].id}`);
      const lessonShifts = clone.getLessonShifts(flatted[0]);

      if (!lessonShifts) {
        throw new Error('Could not resolve the timetable!');
      }

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

    this.save();
  }

  /**
   * Return a array of lesson and slots that should be shifted / reassigned.
   *
   * @param      {any}  lesson     lesson object
   * @param      {Array}   [todos=[{foundSlot, lesson}]  ]  The todos
   * @return     {Array}   todos
   */
  getLessonShifts(lesson, todos = [], deep = 0) {
    console.log(`---- ${lesson.id} - deep ${deep}} -----`);
    let foundSlot = this.getFreeLessonSlot(lesson);

    if (foundSlot) {
      // if a slot was found, apply it and return it
      todos.push({ foundSlot, lesson });
      return todos;
    }

    // iterate through all classes and try to shift lessons
    const clone = this.clone();
    const classIds = Object.keys(this.school.classes);
    // have a look at all classes that are referenced to this lesson
    const refClasses = lesson.id.split('|||').map(id => this.getClassIdForLesson(id));

    for (let i = 0; i < classIds.length; i += 1) {
      const classId = classIds[i];

      for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
        for (let hourIndex = 0; hourIndex < maxHours; hourIndex += 1) {
          // only try to use this block, if it wasnt blocked before by the recursion
          if (!clone.isSlotBlocked(classId, { dayIndex, hourIndex })) {
            // revert all lessons of all referenced classes at the specific time
            const revertedLessons = refClasses
              .map(refId => clone[refId][dayIndex][hourIndex])
              .filter(revertedLesson => !!revertedLesson);
            // if at least one lesson was found, we need to check if we can place the lesson here
            if (revertedLessons.length > 0) {
              revertedLessons.forEach(revertedLesson => {
                clone.revertLesson(revertedLesson.id, { dayIndex, hourIndex });
              });

              // if we now found a free slot, assign the current lesson and try to resolve the
              // reverted lessons
              foundSlot = clone.getFreeLessonSlot(lesson);
              if (foundSlot) {
                // assign the new lesson and block this slot for the clone
                clone.assignLesson(lesson, foundSlot);
                clone.setBlocked(lesson.id, { dayIndex, hourIndex });
                console.log(`blocked - ${lesson.id} - [${dayIndex}][${hourIndex}]`);

                // search for a new slot for the reverted lessons
                const cloneShifts = revertedLessons
                  // eslint-disable-next-line no-loop-func
                  .map((revertedLesson) => clone.getLessonShifts(
                    revertedLesson,
                    [{ foundSlot, lesson }], deep + 1),
                  )
                  .filter(shift => !!shift);
                // only continue, if all other shifts could be assinged back
                if (cloneShifts.length === revertedLessons.length) {
                  console.log(`found slot for ${lesson.id} - [${dayIndex}][${hourIndex}]`);
                  return [...todos].concat(...cloneShifts);
                }
              } else {
                console.log(`reverted slot for ${lesson.id} - [${dayIndex}][${hourIndex}]`);
                // revert the revert
                revertedLessons.forEach(revertedLesson => {
                  clone.assignLesson(revertedLesson, { dayIndex, hourIndex });
                });
              }
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Get a currently avaiable lesson slot. If not slot could be found, return null.
   *
   * @param      {any}  lesson  lesson to apply to the plan
   */
  getFreeLessonSlot(lesson) {
    const { id, teachers } = lesson;
    const ids = id.split('|||');
    // preload teacher plans for this lesson, to only calculate it once per getFreeLessonSlot
    const teacherPlans = { };
    teachers.forEach((teacherId) => {
      teacherPlans[teacherId] = this.getTeacherPlan(teacherId);
    });

    // iterate through all sorted days and hours (sortedDayIndex is only used for iterating days
    // with the most less hours)
    let sortedDayIndex = 0;
    let dayIndex;
    let hourIndex = 0;

    // search for available gaps
    let found;
    while (!found) {
      let isValid = true;

      // check all referenced classes for free slots
      for (let idIndex = 0; idIndex < ids.length; idIndex += 1) {
        const lessonId = ids[idIndex];
        const classId = this.getClassIdForLesson(lessonId);
        // sort days by amount of hours
        const classPlan = this[classId];
        const sortedDays = [].concat(classPlan).sort((a, b) => a.length - b.length);

        dayIndex = classPlan.indexOf(sortedDays[sortedDayIndex]);
        // get original day index, so the correct order will be used
        const day = sortedDays[dayIndex];

        if (day.length >= maxHours) {
          throw new Error('Toooo many hours');
        }

        // is their a gap in the class plan?
        if (this.isSlotBlocked(classId, { dayIndex, hourIndex })
            || classPlan[dayIndex][hourIndex]) {
          isValid = false;
          break;
        } else {
          // allow the same lesson only 2 times a day
          const lessonCount = classPlan[dayIndex].filter((sub) => sub && sub.id === id)
            .length;
          if (lessonCount > 1) {
            isValid = false;
            break;
          } else {
            // check if teachers have times
            /* eslint-disable no-loop-func */
            teachers.forEach((teacherId) => {
              const teacherConfig = this.school.teachers[teacherId];
              const teacherPlan = teacherPlans[teacherId][dayIndex];

              // check teacher config, if the teacher is not the house at this time
              if (teacherConfig.days[dayIndex].indexOf(hourIndex + 1) === -1) {
                isValid = false;
              // check if teacher is already planned at this time
              } else if (teacherPlan[hourIndex]) {
                isValid = false;
              }
            });

            if (!isValid) {
              break;
            }
          }
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
   * @param      {any}     planLesson      plan lesson object created with getPlanLesson
   * @param      {Object}  arg2            lesson slot
   * @param      {number}  arg2.dayIndex   day of the slot
   * @param      {number}  arg2.hourIndex  hour at this day
   */
  assignLesson(planLesson, { dayIndex, hourIndex }) {
    // lesson ids are joined with a seperator, so one lesson reference can be applied to multiple
    // classes
    const ids = planLesson.id.split('|||');
    ids.forEach((id) => {
      const classId = this.getClassIdForLesson(id);
      this[classId][dayIndex][hourIndex] = { ...planLesson };
    });
  }

  /**
   * Generate the plan for a teacher from all classes.
   *
   * @param      {string}  teacherId  id of the teacher to generate the plan for
   */
  getTeacherPlan(teacherId) {
    const plan = planPreset();

    this.iteratePlans((classId, dayIndex, hourIndex) => {
      const lesson = this[classId][dayIndex][hourIndex];
      if (lesson && lesson.teachers.indexOf(teacherId) !== -1) {
        plan[dayIndex][hourIndex] = lesson;
      }
    });

    return plan;
  }

  /**
   * Return a lesson object that can be inserted into a timetable plan.
   *
   * @param      {string}  classId   class id to check for lesson
   * @param      {string}  lessonId  lesson id to check for
   * @return     {Object}  The plan lesson.
   */
  getPlanLesson(lessonId, inputClassId) {
    // find missing class
    const classId = inputClassId || this.getClassIdForLesson(lessonId);
    const classDef = this.school.classes[classId];
    const lesson = classDef.lessons[lessonId];

    // merge teachers and lessons of all references together
    const teachers = [...lesson.teachers];
    const lessons = [...lesson.teachers];
    lesson.lessons.forEach((referencedId) => {
      const linkedClassId = this.getClassIdForLesson(referencedId);
      const linkedLesson = this.school.classes[linkedClassId].lessons[referencedId];
      linkedLesson.teachers.forEach((ref) => {
        if (teachers.indexOf(ref) === -1) {
          teachers.push(ref);
        }
      });
      linkedLesson.lessons.forEach((ref) => {
        if (lessons.indexOf(ref) === -1) {
          lessons.push(ref);
        }
      });
    });

    return {
      id: this.getReferenceLessonId(lesson, lessonId),
      instance: lesson,
      lessonId,
      lessons,
      teachers,
    };
  }

  /**
   * Return a id for a lesson with multiple lesson references.
   *
   * @param      {<type>}  lesson  The lesson
   * @return     {<type>}  The reference lesson identifier.
   */
  getReferenceLessonId(lesson, lessonId = lesson.lessonId) {
    return [lessonId, ...lesson.lessons].sort().join('|||');
  }

  /**
   * Remove a lesson from a time slot.
   *
   * @param      {any}     lesson          lesson configuration
   * @param      {Object}  arg2            lesson slot
   * @param      {number}  arg2.dayIndex   day of the slot
   * @param      {number}  arg2.hourIndex  hour at this day
   */
  revertLesson(lessonId, { dayIndex, hourIndex }) {
    // lesson ids are joined with a seperator, so one lesson reference can be applied to multiple
    // classes
    const ids = lessonId.split('|||');
    ids.forEach((id) => {
      const classId = this.getClassIdForLesson(id);
      this[classId][dayIndex][hourIndex] = null;
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
   * @param      {string}  lessonId    class id to block
   * @param      {number}  dayIndex   day index to block
   * @param      {number}  hourIndex  hour index to block
   */
  setBlocked(lessonId, { dayIndex, hourIndex }) {
    const ids = lessonId.split('|||');
    ids.forEach((id) => {
      const classId = this.getClassIdForLesson(id);
      this.blocked[`${classId}-${dayIndex}-${hourIndex}`] = true;
    });
  }

  /**
   * Check if a specific hour is blocked.
   *
   * @param      {string}   classId    class id to check
   * @param      {number}   dayIndex   day index to check
   * @param      {number}   hourIndex  hour index to check
   * @return     {boolean}  True if slot blocked, False otherwise
   */
  isSlotBlocked(classId, { dayIndex, hourIndex }) {
    return (this[classId][dayIndex][hourIndex] && this[classId][dayIndex][hourIndex].locked)
      || this.blocked[`${classId}-${dayIndex}-${hourIndex}`];
  }

  /**
   * Update all lessons, classes and texts to latest configuration.
   */
  updateForConfig() {
    this.iteratePlans((classId, dayIndex, hourIndex) => {
      const lesson = this[classId][dayIndex][hourIndex];
      if (lesson) {
        // apply latest texts and specifications from user configuration
        this[classId][dayIndex][hourIndex] = lesson.getPlanLesson(lesson.lessonId, lesson.classId);
      }
    });
  }

  /**
   * Iterate over the plan of all classes (or a specific one) and runs a callback function. If false
   * is returned, the loop will be stopped.
   *
   * @param      {Function}  callback  function that should be called (classId, dayIndex, hourIndex)
   * @param      {string}    classId   iterate only for a specific class id
   * @return     {any}       callback result or null
   */
  iteratePlans(callback, classId) {
    const classIds = Object.keys(this.school.classes);

    for (let i = 0; i < classIds.length; i += 1) {
      if (!classId || (classId && classId === classIds[i])) {
        // apply latest texts and specifications from user configuration
        for (let dayIndex = 0; dayIndex < 5; dayIndex += 1) {
          for (let hourIndex = 0; hourIndex < maxHours; hourIndex += 1) {
            const result = callback(classIds[i], dayIndex, hourIndex);
            if (result) {
              return result;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Lock a specific lesson at a specific time.
   *
   * @param      {string}  lessonId   lesson id
   * @param      {number}  dayIndex   day to lock
   * @param      {number}  hourIndex  hour to lock
   */
  lockLesson(lessonId, { dayIndex, hourIndex }) {
    const ids = lessonId.split('|||');
    ids.forEach((id) => {
      const classId = this.getClassIdForLesson(id);
      const lesson = this.getPlanLesson(id, classId);
      this[classId][dayIndex][hourIndex] = lesson;
      this[classId][dayIndex][hourIndex].locked = true;
    });
  }

  /**
   * Find the class id for a specific lesson id.
   *
   * @param      {string}  lessondId  lesson id to get the class id for
   * @return     {string}  class id
   */
  getClassIdForLesson(lessondId) {
    const classIds = Object.keys(this.school.classes);

    for (let i = 0; i < classIds.length; i += 1) {
      if (this.school.classes[classIds[i]].lessons[lessondId]) {
        return classIds[i];
      }
    }

    return null;
  }
}

export default TimetableGenerator;
