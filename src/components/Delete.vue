<template>
  <div>
    <i
      :class="`text-${color}`"
      :title="$t(`_lp.delete`)"
      @click="$refs.deleteModal.show()"
      class="mdi mdi-delete h4 ml-3 d-flex align-items-center mb-0 h-100"
      v-b-tooltip.hover
    />

    <b-modal
      ref="deleteModal"
      :title="$t('_lp.delete')"
      hide-footer>
      <p class="my-4">
        {{ '_lp.delete-long' | translate }}
      </p>

      <div class="text-right">
        <b-button
          class="mt-3"
          @click="$refs.deleteModal.hide();">
          {{ '_lp.cancel' | translate }}
        </b-button>
        <b-button
          class="mt-3"
          variant="danger"
          @click="
            $refs.deleteModal.hide();
            lessonPlanning.deleteId(id);
            $emit('on-delete');
          ">
          {{ '_lp.delete' | translate }}
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import lessonPlanning from '../LessonPlanning';

export default {
  name: 'Delete',
  data() {
    return {
      lessonPlanning,
    };
  },
  props: ['id', 'color'],
};
</script>

<style lang="scss" scoped>

</style>
