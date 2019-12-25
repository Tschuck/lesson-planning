<template>
  <div>
    <lp-header>
      <b-navbar-nav class="ml-auto d-flex">
        <div>
          <i
            :title="$t(`_lp.school.add`)"
            @click="lessonPlanning.addSchool()"
            class="mdi mdi-plus-circle h4 ml-3 d-flex text-white align-items-center mb-0 h-100"
            v-b-tooltip.hover
          />
        </div>
        <div>
          <i
            :title="$t(`_lp.school.import`)"
            @click="$refs.importModal.show()"
            class="mdi mdi-upload h4 ml-3 d-flex text-white align-items-center mb-0 h-100"
            v-b-tooltip.hover
          />
        </div>
      </b-navbar-nav>
    </lp-header>

    <b-modal
      :title="$t('_lp.school.import')"
      hide-footer
      ref="importModal">

      <div class="custom-file">
        <input
          accept=".json"
          class="custom-file-input"
          id="schoolImport"
          ref="schoolImport"
          type="file"
          v-on:change="importSchool()">
          <p class="text-danger" v-if="importError">
            {{ '_lp.school.invalid-import' | translate }}
          </p>
        <label class="custom-file-label" for="schoolImport">
          {{ '_lp.school.import-file' | translate }}
        </label>
      </div>

      <div class="text-right">
        <b-button
          class="mt-3"
          @click="$refs.importModal.hide();">
          {{ '_lp.close' | translate }}
        </b-button>
      </div>
    </b-modal>

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
      importError: false,
      lessonPlanning,
      schools: lessonPlanning.schools,
    };
  },
  methods: {
    importSchool() {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const id = lessonPlanning.addSchool(JSON.parse(event.target.result));
          this.importError = false;
          this.$refs.importModal.hide();
          this.$router.push(`/school/${id}`);
        } catch (ex) {
          console.error(ex.message);
          this.importError = true;
        }
      };
      reader.readAsText(this.$refs.schoolImport.files[0]);
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
