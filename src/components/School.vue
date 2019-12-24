<template>
  <div class="h-100 d-flex flex-column">
    <lp-header>
      <b-navbar-nav class="ml-auto">
        <b-form-input
          style="max-width: 200px;"
          v-model="school.name"
          :placeholder="$t('_lp.school.name')"
        />
        <lp-delete
          :id="this.$route.params.id"
          @on-delete="$router.push('/')"
        />
      </b-navbar-nav>
    </lp-header>

    <div class="row" style="height: calc(100% - 66px)">
      <b-nav vertical
        class="col-lg-2 col-md-3 border-right pr-0 overflow-auto flex-nowrap"
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
      <div class="col-lg-10 col-md-9 p-5">
        <router-view v-if="$route.params.classId" />
        <div class="text-center" v-else>
          <h3>
            {{ '_lp.class.empty' | translate }}
          </h3>

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
</template>

<script>
import Delete from './Delete';
import Header from './Header';
import lessonPlanning from '../LessonPlanning';

export default {
  name: 'Schools',
  components: {
    'lp-delete': Delete,
    'lp-header': Header,
  },
  data() {
    const school = lessonPlanning[this.$route.params.id];
    return {
      classes: Object.keys(school.classes),
      lessonPlanning,
      school,
    };
  },
  created() {
    // navigate to first class, if no one is selected
    if (this.classes.length !== 0 && !this.$route.params.classId) {
      this.$router.replace(`./${this.$route.params.id}/${this.classes[0]}`);
    }
  },
  methods: {
    addClass() {
      const id = lessonPlanning.addClass(this.$route.params.id);
      this.classes.push(id);
    }
  },
};
</script>

<style lang="scss" scoped>

</style>
