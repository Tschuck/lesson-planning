<template>
  <div>
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
              <th class="bg-white" scope="col">{{ '_lp.days.0' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.days.1' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.days.2' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.days.3' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.days.4' | translate }}</th>
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
          @click="hide();">
          {{ '_lp.close' | translate }}
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script>
import Delete from './Delete';
import lessonPlanning from '../LessonPlanning';

export default {
  name: 'Schools',
  components: {
    'lp-delete': Delete,
  },
  data() {
    const school = lessonPlanning[this.$route.params.id];

    return {
      classes: Object.keys(school.classes),
      school,
      teachers: Object.keys(school.teachers),
    };
  },
  methods: {
    addTeacher() {
      const id = lessonPlanning.addTeacher(this.$route.params.id);
      this.teachers.push(id);
    },
    hide() {
      this.$hide();
    },
    show() {
      this.$refs.teacherModal.show();
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
