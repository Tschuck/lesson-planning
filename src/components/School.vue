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

    <b-modal
      :title="$t('_lp.teachers.title')"
      hide-footer
      ref="teacherModal"
      size="xl">
      <div
        class="text-center p-5"
        v-if="teachers.length === 0">
        <p>
          {{ '_lp.teachers.empty' | translate }}
        </p>

        <b-button
          class="mt-3"
          variant="primary"
          @click="addTeacher()">
          {{ '_lp.teachers.add' | translate }}
        </b-button>
      </div>
      <div v-else>
        <table class="table border">
          <thead>
            <tr>
              <th class="bg-white" scope="col">{{ '_lp.teachers.name' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.teachers.days.0' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.teachers.days.1' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.teachers.days.2' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.teachers.days.3' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.teachers.days.4' | translate }}</th>
              <th class="bg-white" scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="bg-light"
              v-for="(teacher, index) in teachers"
              :key="teacher">
              <th>
                <b-form-input
                  v-model="school.teachers[teacher].name"
                  :placeholder="$t('_lp.teachers.name')"
                />
              </th>
              <td
                :key="index"
                v-for="(day, index) in school.teachers[teacher].days">
                <v-select
                  :options="[1,2,3,4,5,6,7,8]"
                  multiple
                  v-model="school.teachers[teacher].days[index]"
                  @change="$set(
                    school.teachers[teacher].days,
                    index,
                    school.teachers[teacher].days[index]
                  )">
                </v-select>
              </td>
              <td>
                <lp-delete
                  :id="teacher"
                  @on-delete="teachers.splice(index, 1)"
                  color="dark"
                />
              </td>
            </tr>
            <tr>
              <td class="text-right table-light border-top">
                <b-button
                  variant="primary"
                  @click="addTeacher()">
                  {{ '_lp.teachers.add' | translate }}
                </b-button>
              </td>
              <td class="table-light border-top" />
              <td class="table-light border-top" />
              <td class="table-light border-top" />
              <td class="table-light border-top" />
              <td class="table-light border-top" />
              <td class="table-light border-top" />
            </tr>
          </tbody>
        </table>
      </div>

      <div class="text-right">
        <b-button
          class="mt-3"
          @click="$refs.teacherModal.hide();">
          {{ '_lp.close' | translate }}
        </b-button>
      </div>
    </b-modal>
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
      teachers: Object.keys(school.teachers),
    };
  },
  created() {
    // navigate to first class, if no one is selected
    // if (this.classes.length !== 0 && !this.$route.params.classId) {
    //   this.$router.replace(`./${this.$route.params.id}/${this.classes[0]}`);
    // }
  },
  methods: {
    addClass() {
      const id = lessonPlanning.addClass(this.$route.params.id);
      this.classes.push(id);
      this.$router.push(`/school/${this.$route.params.id}/${id}`);
    },
    addTeacher() {
      const id = lessonPlanning.addTeacher(this.$route.params.id);
      this.teachers.push(id);
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
