<template>
  <div class="bg-light h-100 border shadow d-flex flex-column">
    <div class="d-flex align-items-center pt-4 px-4">
      <h4 class="mb-0">{{ '_lp.class.config' | translate }}</h4>

      <div class="ml-auto d-flex">
        <b-form-input
          style="max-width: 200px;"
          v-model="classObj.name"
          :placeholder="$t('_lp.class.name')"
        />
        <lp-delete
          :id="this.$route.params.classId"
          @on-delete="$router.push(`/school/${$route.params.id}`)"
          color="dark"
        />
      </div>
    </div>
    <div class="overflow-auto">
      <div class="text-center p-5" v-if="lessons.length === 0">
        <h5>
          {{ '_lp.lesson.empty' | translate }}
        </h5>

        <b-button
          class="mt-3"
          variant="primary"
          @click="addLesson()">
          {{ '_lp.lesson.add' | translate }}
        </b-button>
      </div>
      <div class="p-4" v-else>
        <table class="table border">
          <thead>
            <tr>
              <th class="bg-white" scope="col">{{ '_lp.lesson.title' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.lesson.hours' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.lesson.teachers' | translate }}</th>
              <th class="bg-white" scope="col">{{ '_lp.lesson.lesson-ref' | translate }}</th>
              <th class="bg-white" scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(lesson, index) in lessons"
              :key="lesson">
              <th>
                <b-form-input
                  :placeholder="$t('_lp.class.name')"
                  style="max-width: 300px"
                  v-model="classObj.lessons[lesson].name"
                />
              </th>
              <td>
                <b-form-input
                  style="width: 80px"
                  v-model="classObj.lessons[lesson].hours"
                  :placeholder="$t('_lp.class.name')"
                />
              </td>
              <td>
                <v-select
                  style="max-width: 300px"
                  :options="teacherOptions()"
                  multiple
                  v-model="classObj.lessons[lesson].teachers"
                  @change="$set(
                    classObj.lessons[lesson],
                    'teachers',
                    classObj.lessons[lesson].teachers
                  )">
                </v-select>
              </td>
              <td>
                <v-select
                  style="max-width: 300px"
                  :options="classReferenceOptions()"
                  multiple
                  v-model="classObj.lessons[lesson].lessons"
                  @change="$set(
                    classObj.lessons[lesson],
                    'lessons',
                    classObj.lessons[lesson].lessons
                  )">
                </v-select>
              </td>
              <td>
                <lp-delete
                  :id="lesson"
                  @on-delete="lessons.splice(index, 1)"
                  color="dark"
                />
              </td>
            </tr>
            <tr>
              <td class="bg-white text-right">
                <b-button
                  variant="primary"
                  @click="addLesson()">
                  {{ '_lp.lesson.add' | translate }}
                </b-button>
              </td>
              <td class="bg-white" />
              <td class="bg-white" />
              <td class="bg-white" />
              <td class="bg-white" />
            </tr>
          </tbody>
        </table>
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
    const classObj = lessonPlanning[this.$route.params.id].classes[this.$route.params.classId];
    return {
      classObj,
      lessonPlanning,
      lessons: Object.keys(classObj.lessons),
      school: lessonPlanning[this.$route.params.id],
    };
  },
  methods: {
    addLesson() {
      const id = lessonPlanning.addLesson(this.$route.params.id, this.$route.params.classId);
      this.lessons.push(id);
    },
    teacherOptions() {
      const school = lessonPlanning[this.$route.params.id];
      const teachers = school.teachers;
      return Object
        .keys(teachers)
        .map(teacherKey => ({
          label: school.teachers[teacherKey].name,
          key: teacherKey,
        }));
    },
    classReferenceOptions() {
      const school = lessonPlanning[this.$route.params.id];
      const classes = school.classes;
      const options = [];

      Object
        .keys(classes)
        .forEach(classKey => Object.keys(classes[classKey].lessons).forEach(lessonKey =>
          options.push({
            label: `${classes[classKey].name} - ${classes[classKey].lessons[lessonKey].name}`,
            key: lessonKey,
          }),
        ));

      return options;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
