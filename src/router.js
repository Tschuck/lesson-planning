import Router from 'vue-router';
import School from '@/components/School';
import Schools from '@/components/Schools';
import SchoolClass from '@/components/SchoolClass';
import Vue from 'vue';

Vue.use(Router);

export default new Router({
  mode: 'hash',
  routes: [
    { path: '', redirect: 'schools' },
    { path: '/schools', name: 'schools', component: Schools },
    {
      path: '/school/:id',
      name: 'school',
      component: School,
      children: [
        { path: ':classId', name: 'school-class', component: SchoolClass },
      ],
    },
  ],
});
