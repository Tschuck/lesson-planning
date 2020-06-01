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
            class="mb-0 ml-3 text-white mdi mdi-account-multiple h4 d-flex align-items-center h-100"
            v-b-tooltip.hover
          />
        </div>
        <div>
          <i
            :title="$t(`_lp.school.export`)"
            @click="exportSchool()"
            class="mb-0 ml-3 text-white mdi mdi-download h4 d-flex align-items-center h-100"
            v-b-tooltip.hover
          />
        </div>
        <div>
          <a
            href="https://github.com/Tschuck/lesson-planning"
            :title="$t(`_lp.github`)"
            v-b-tooltip.hover
            target="_blank"
          >
            <i
              class="mb-0 ml-3 text-white mdi mdi-github h4 d-flex align-items-center h-100"
            />
          </a>
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
        class="pr-0 overflow-auto col-lg-2 col-md-3 border-right flex-nowrap bg-light"
        style="max-height: 100%">
        <b-nav-item
          :key="classId"
          :style="`border-right: ${$route.params.classId === classId ? '5px solid #dcd1d8' : '0'}`"
          :to="`/school/${ $route.params.id }/${ classId }`"
          class="px-3 py-2 border-bottom"
          v-for="classId in classes">
          {{ school.classes[classId].name }}
        </b-nav-item>
        <b-nav-item class="px-3 py-2 border-bottom"
          @click="addClass()">
          <i class="mdi mdi-plus"></i>
          {{ '_lp.class.add' | translate }}
        </b-nav-item>
      </b-nav>
      <div class="overflow-auto col-lg-10 col-md-9"
        style="max-height: 100%">
        <div class="p-4 h-100">
          <router-view v-if="$route.params.classId" />
          <div class="p-5 text-center" v-else>
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
