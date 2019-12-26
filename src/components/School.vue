<template>
  <div class="h-100 d-flex flex-column">
    <lp-header>
      <b-navbar-nav class="ml-auto d-flex">
        <b-form-input
          style="max-width: 200px;"
          v-model="school.name"
          :placeholder="$t('_lp.school.name')"
        />
        <div>
          <i
            :title="$t(`_lp.teachers.title`)"
            @click="$refs.teacherModal.show()"
            class="mdi mdi-account-multiple h4 ml-3 d-flex text-white align-items-center mb-0 h-100"
            v-b-tooltip.hover
          />
        </div>
        <div>
          <i
            :title="$t(`_lp.school.export`)"
            @click="exportSchool()"
            class="mdi mdi-download h4 ml-3 d-flex text-white align-items-center mb-0 h-100"
            v-b-tooltip.hover
          />
        </div>
        <lp-delete
          :id="this.$route.params.id"
          @on-delete="$router.push('/')"
          color="white"
        />
      </b-navbar-nav>
    </lp-header>

    <div class="row" style="height: calc(100% - 66px)">
      <b-nav vertical
        class="col-lg-2 col-md-3 border-right pr-0 overflow-auto flex-nowrap bg-light"
        style="max-height: 100%">
        <b-nav-item
          :key="classId"
          :style="`border-right: ${$route.params.classId === classId ? '5px solid #dcd1d8' : '0'}`"
          :to="`/school/${ $route.params.id }/${ classId }`"
          class="border-bottom px-3 py-2"
          v-for="classId in classes">
          {{ school.classes[classId].name }}
        </b-nav-item>
        <b-nav-item class="border-bottom px-3 py-2"
          @click="addClass()">
          <i class="mdi mdi-plus"></i>
          {{ '_lp.class.add' | translate }}
        </b-nav-item>
      </b-nav>
      <div class="col-lg-10 col-md-9 overflow-auto"
        style="max-height: 100%">
        <div class="p-4 h-100">
          <router-view v-if="$route.params.classId" />
          <div class="text-center p-5" v-else>
            <h5>
              {{ '_lp.class.empty' | translate }}
            </h5>

            <b-button
              class="mt-3"
              variant="primary"
              @click="addClass()">
              {{ '_lp.class.add' | translate }}
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <lp-teachers ref="teacherModal" />
    <lp-timetable-overview />
  </div>
</template>

<script>
import Delete from './Delete';
import Header from './Header';
import Teachers from './Teachers';
import TimetableOverview from './TimetableOverview';
import lessonPlanning from '../LessonPlanning';

export default {
  name: 'Schools',
  components: {
    'lp-delete': Delete,
    'lp-header': Header,
    'lp-teachers': Teachers,
    'lp-timetable-overview': TimetableOverview,
  },
  data() {
    const school = lessonPlanning[this.$route.params.id];

    return {
      classes: Object.keys(school.classes),
      school,
    };
  },
  methods: {
    addClass() {
      const id = lessonPlanning.addClass(this.$route.params.id);
      this.classes.push(id);
      this.$router.push(`/school/${this.$route.params.id}/${id}`);
    },
    exportSchool() {
      const dataStr = `data:text/json;charset=utf-8, ${encodeURIComponent(
        JSON.stringify(this.school))}`;
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `${this.school.name}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
