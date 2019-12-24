<template>
  <div>
    <i
      :title="$t(`_lp.delete`)"
      class="mdi mdi-delete text-white h4 ml-3 d-flex align-items-center mb-0 h-100"
      v-b-modal.deleteModal
      v-b-tooltip.hover
    />

    <b-modal id="deleteModal" :title="$t('_lp.delete')" hide-footer>
      <p class="my-4">
        {{ '_lp.delete-long' | translate }}
      </p>

      <div class="text-right">
        <b-button
          class="mt-3"
          @click="$bvModal.hide('deleteModal')">
          {{ '_lp.cancel' | translate }}
        </b-button>
        <b-button
          class="mt-3"
          variant="danger"
          @click="
            $bvModal.hide('deleteModal');
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
  props: ['id'],
};
</script>

<style lang="scss" scoped>

</style>
