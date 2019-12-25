import Router from 'vue-router';
import School from '@/components/School';
import Schools from '@/components/Schools';
import SchoolClass from '@/components/SchoolClass';
import Vue from 'vue';

import lessonPlanning from './LessonPlanning';

Vue.use(Router);

export default new Router({
  mode: 'hash',
  routes: [
    { path: '', redirect: 'schools' },
    { path: '/schools', name: 'schools', component: Schools },
    {
      path: '/school/:id',
      component: School,
      beforeEnter: (to, from, next) => {
        if (!lessonPlanning[to.params.id]) {
          next('/schools');
        } else {
          next();
        }
      },
      children: [
        {
          path: '',
          component: SchoolClass,
          beforeEnter: (to, from, next) => {
            const schoolId = to.params.id;
            const classes = Object.keys(lessonPlanning[schoolId].classes);

            if (classes.length > 0) {
              next(`${to.path}/${classes[0]}`);
            } else {
              next();
            }
          },
        },
        {
          path: ':classId',
          name: 'school-class',
          component: SchoolClass,
          beforeEnter: (to, from, next) => {
            if (!lessonPlanning[to.params.id].classes[to.params.classId]) {
              next(to.path.replace(`/${to.params.classId}`, ''));
            } else {
              next();
            }
          },
        },
      ],
    },
  ],
});
