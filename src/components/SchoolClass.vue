<template>
  <div>
    <div class="d-flex">
      <b-form-input
        style="max-width: 200px;"
        v-model="classObj.name"
        :placeholder="$t('_lp.class.name')"
      />

      <div>
        <lp-delete
          class="ml-auto"
          :id="this.$route.params.classId"
          @on-delete="$router.push('..')"
        />
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
      classObj: lessonPlanning[this.$route.params.id],
    };
  },
};
</script>

<style lang="scss" scoped>

</style>
