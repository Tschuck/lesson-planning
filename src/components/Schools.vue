<template>
  <div>
    <lp-header />

    <div class="container">
      <div class="row">
        <router-link
          :event="!lessonPlanning[key].error ? 'click' : ''"
          :key="key"
          :to="`school/${ key }`"
          class="col-md-3 p-3"
          v-for="key in schools">
          <b-card
            style="height: 80px"
            :class="{
              'bg-danger text-white': lessonPlanning[key].error,
            }">
            <b-card-title class="mb-0 d-flex align-items-center" style="height: 100%">
              <h4 class="mb-0">{{ lessonPlanning[key].name }}</h4>
            </b-card-title>
          </b-card>
        </router-link>
        <div
          class="col-md-3 p-3">
          <b-card style="height: 80px; cursor:pointer;"
            @click="lessonPlanning.addSchool()">
            <b-card-title class="mb-0 d-flex align-items-center">
              <i class="mdi mdi-plus h2 mb-0 mr-3"></i>
              <h4 class="mb-0">{{ '_lp.school.add' | translate }}</h4>
            </b-card-title>
          </b-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from './Header';
import lessonPlanning from '../LessonPlanning';

export default {
  name: 'Schools',
  components: {
    'lp-header': Header,
  },
  data() {
    return {
      lessonPlanning,
      schools: lessonPlanning.schools,
    };
  },
};
</script>

<style lang="scss" scoped>

</style>
