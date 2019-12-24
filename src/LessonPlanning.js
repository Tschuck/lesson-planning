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
      classes: { },
      lessons: { },
      name: `${vue.$t('_lp.class.title')} - ${Object.keys(this[schoolId].classes).length + 1}`,
      teachers: { },
    };

    return id;
  }

  /**
   * Add a new school object to the instance and to the array of available once.
   *
   * @param      {Vue}  vue     optional vue instance for forcing ui updates
   */
  addSchool() {
    const id = utils.generateUID();
    this.schools.push(id);
    this[id] = {
      classes: { },
      lessons: { },
      name: `${vue.$t('_lp.school.title')} - ${this.schools.length}`,
      teachers: { },
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
