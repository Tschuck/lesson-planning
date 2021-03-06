import vue from './index';
import utils from './utils';

class LessonPlanning {
  /**
   * Load all available schools
   */
  constructor() {
    try {
      this.schools = JSON.parse(window.localStorage.schools);
    } catch (ex) {
      this.schools = [];
    }

    // load schools
    this.schools.forEach((key) => {
      try {
        this[key] = JSON.parse(window.localStorage[key]);
      } catch (ex) {
        this[key] = { name: 'invalid school', error: true };
      }
    });

    // ensure saved states on browser refresh
    window.addEventListener('beforeunload', () => this.save());
  }

  addClass(schoolId) {
    const id = utils.generateUID();
    this[schoolId].classes[id] = {
      lessons: { },
      name: `${vue.$t('_lp.class.title')} - ${Object.keys(this[schoolId].classes).length + 1}`,
    };

    return id;
  }

  /**
   * Add a new school object to the instance and to the array of available once.
   *
   * @param      {any}     school  optional school object
   * @return     {<type>}  { description_of_the_return_value }
   */
  addSchool(school) {
    const id = utils.generateUID();
    this.schools.push(id);
    this[id] = school || {
      classes: { },
      lessons: { },
      name: `${vue.$t('_lp.school.title')} - ${this.schools.length}`,
      teachers: { },
    };

    return id;
  }

  /**
   * Add a new lesson to a class.
   *
   * @param      {string}  schoolId  id of the scool
   * @param      {string}  classId   id of the class
   */
  addLesson(schoolId, classId) {
    const id = utils.generateUID();
    const lessonCount = Object.keys(this[schoolId].classes[classId].lessons).length;

    this[schoolId].classes[classId].lessons[id] = {
      hours: 0,
      lessons: [],
      name: `${vue.$t('_lp.lesson.title')} ${lessonCount + 1}`,
      teachers: [],
    };

    return id;
  }

  /**
   * Add a new lesson to a class.
   *
   * @param      {string}  schoolId  id of the scool
   * @param      {string}  classId   id of the class
   */
  addTeacher(schoolId) {
    const id = utils.generateUID();
    const lessonCount = Object.keys(this[schoolId].teachers).length;

    this[schoolId].teachers[id] = {
      name: `${vue.$t('_lp.teachers.teacher')} ${lessonCount + 1}`,
      days: [
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6],
        [1, 2, 3, 4, 5, 6],
      ],
    };

    return id;
  }

  /**
   * Search for id references and remove them from the schoold structure.
   *
   * @param      {string}  deleteId  id to remove
   */
  deleteId(deleteId) {
    const deleteRec = (parent, id) => {
      if (parent) {
        if (Array.isArray(parent[id])) {
          parent[id].forEach(item => deleteRec(item));
        } else if (typeof parent[id] === 'object' && parent[id] !== null) {
          Object.keys(parent[id]).forEach(key => deleteRec(parent[id], key));
        }

        // when the id should be delted, remove it from the array or delete the object
        if (deleteId === id) {
          if (Array.isArray(parent)) {
            parent.splice(parent.indexOf(id), 1);
          } else if (parent && parent[id]) {
            delete parent[id]; // eslint-disable-line no-param-reassign
          }
        }
      }
    };

    // remove the reference from all schools
    this.schools.forEach((schoolId) => {
      // delete all id references
      deleteRec(this, schoolId);

      // remove the whole
      if (schoolId === deleteId) {
        delete window.localStorage[deleteId];
        this.schools.splice(this.schools.indexOf(deleteId), 1);
      }
    });
  }

  /**
   * Copy a class definition and assign it to a new id.
   *
   * @param      {string}  schooldId  id of school, where the class is added
   * @param      {string}  id         class id to copy
   * @return     {string}  new copied id
   */
  duplicate(schooldId, id) {
    const origin = this[schooldId];
    const copyClass = JSON.parse(JSON.stringify(origin.classes[id]));
    copyClass.lessons = {};

    // assign new id's to the lessons
    Object
      .keys(origin.classes[id].lessons)
      .forEach((key) => {
        const originLesson = origin.classes[id].lessons[key];

        // copy lesson and reset values
        const copyLesson = JSON.parse(JSON.stringify(originLesson));
        copyLesson.teachers = [];
        copyLesson.lessons = [];

        copyClass.lessons[utils.generateUID()] = copyLesson;
      });

    // assign to new id
    const newId = utils.generateUID();
    this[schooldId].classes[newId] = copyClass;

    return newId;
  }

  /**
   * Set the active plans for a specific school
   *
   * @param      {string}      schoolId  school id to set the plans for
   * @param      {Array<any>}  plans     plans to set
   */
  setTimetable(schoolId, timetable) {
    this[schoolId].timetable = timetable;
  }

  /**
   * Save the current states to the browser localStorage.
   */
  save() {
    window.localStorage.schools = JSON.stringify(this.schools);
    this.schools.forEach((key) => {
      window.localStorage[key] = JSON.stringify(this[key]);
    });
  }
}

export default new LessonPlanning();
