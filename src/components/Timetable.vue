<template>
  <div class="px-5 py-3">
    <h3>{{ timetable.name }}</h3>

    <table class="table border" v-if="!loading">
      <thead>
        <tr>
          <th class="bg-white" scope="col">{{ '_lp.hour' | translate }}</th>
          <th class="bg-white" scope="col">{{ '_lp.days.0' | translate }}</th>
          <th class="bg-white" scope="col">{{ '_lp.days.1' | translate }}</th>
          <th class="bg-white" scope="col">{{ '_lp.days.2' | translate }}</th>
          <th class="bg-white" scope="col">{{ '_lp.days.3' | translate }}</th>
          <th class="bg-white" scope="col">{{ '_lp.days.4' | translate }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          :key="hour"
          class="bg-light"
          v-for="(_, hour) in hours">
          <th>{{ hour + 1 }}</th>
          <td
            :key="day"
            v-for="(_, day) in days">
            <div class="d-flex">
              <b-form-checkbox
                :title="'_lp.timetable.lock-lesson' | translate"
                :unchecked-value="null"
                :value="timetable.plan[day][hour] && timetable.plan[day][hour].lessonId
                  ? timetable.plan[day][hour].lessonId : true"
                v-b-tooltip.hover
                v-model="locked[day][hour]"
                @change="changedManual(day, hour)"
              />
              <div v-if="timetable.plan[day][hour] || locked[day][hour]">
                <template v-if="!locked[day][hour]">
                  <b v-if="type === 'class'">
                    {{ timetable.plan[day][hour].lessonName }}
                  </b>
                  <b v-else>
                    {{ timetable.plan[day][hour].className }}
                  </b>
                </template>
                <b-form-select
                  :options="lessonSelect"
                  @change="changedManual($event, day, hour)"
                  v-else
                  v-model="locked[day][hour]"
                />

                <template v-if="timetable.plan[day][hour]">
                  <p class="mb-0" v-if="type === 'teacher'">
                    {{ timetable.plan[day][hour].lessonName }}
                  </p>
                  <p class="mb-0" v-else-if="timetable.plan[day][hour].teachers">
                    <span
                      v-for="teacher in timetable.plan[day][hour].teachers"
                      :key="teacher">
                      {{ teachers[teacher].name }}
                    </span>
                  </p>
                </template>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import lessonPlanning from '../LessonPlanning';

export default {
  name: 'Timetable',
  props: ['timetable', 'type'],
  data() {
    // get maximum amount of hours to render
    let maxHours = 0;
    this.timetable.plan.forEach((day) => {
      if (maxHours < day.length) {
        maxHours = day.length;
      }
    });

    let lessonSelect = [];
    if (this.timetable.classId) {
      // build select box for manual selecting lessons
      const classDef = lessonPlanning[this.$route.params.id].classes[this.timetable.classId];
      const lessons = classDef.lessons;
      lessonSelect = Object.keys(lessons).map((lessonId) => ({
        text: lessons[lessonId].name,
        // IMPORTANT: Use same structure as the `getFlat` method of the TimetableGenerator;
        value: lessonId,
      }));
    } else {
      const { classes } = lessonPlanning[this.$route.params.id];
      Object.keys(classes).forEach((classId) => {
        const { lessons } = classes[classId];
        Object.keys(lessons).forEach((lessonId) => {
          const lesson = lessons[lessonId];
          if (lesson.teachers.indexOf(this.timetable.teacherId) !== -1) {
            lessonSelect.push({
              text: `${lesson.name} (${classes[classId].name})`,
              value: lessonId,
            });
          }
        });
      });
    }

    return {
      days: new Array(5),
      hours: new Array(maxHours),
      lessonSelect,
      loading: true,
      locked: { },
      teachers: lessonPlanning[this.$route.params.id].teachers,
    };
  },
  created() {
    for (let day = 0; day < 5; day += 1) {
      this.locked[day] = {};
      for (let hour = 0; hour < 8; hour += 1) {
        // setup locked info
        if (this.timetable.plan[day][hour]
          && this.timetable.plan[day][hour].locked) {
          this.locked[day][hour] = this.timetable.plan[day][hour].lessonId;
        } else {
          this.locked[day][hour] = false;
        }
      }
    }

    this.loading = false;
  },
  methods: {
    /**
     * The plan has changed manually. Apply the changes or reset a empty object
     *
     * @param      {any}     plan    current plan object
     * @param      {number}  day     day
     * @param      {number}  hour    hour
     */
    async changedManual(previousLesson, day, hour) {
      // wait until dropdown was updated
      await new Promise((resolve) => setTimeout(resolve, 200));

      // only update when the locking was removed or a lesson selected
      if (this.locked[day][hour] !== true) {
        // resolve class id for lesson
        const { classes } = lessonPlanning[this.$route.params.id];
        const lessonId = this.locked[day][hour];
        const classId = Object.keys(classes).filter((id) => {
          if (classes[id].lessons[lessonId]) {
            return true;
          }
          return false;
        })[0];
        // send update event to parent, so the plan can be recalculated
        this.$emit('update', {
          classId,
          day,
          hour,
          previousLesson,
          lessonId: this.locked[day][hour],
        });
      } else {
        this.$forceUpdate();
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
