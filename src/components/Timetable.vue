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
            <div
              class="d-flex"
              v-if="timetable.plan[day][hour]">
              <template v-if="type === 'class'">
                <b-form-checkbox
                  :title="'_lp.timetable.lock-lesson' | translate"
                  :unchecked-value="false"
                  :value="true"
                  v-b-tooltip.hover
                  v-model="timetable.plan[day][hour].locked"
                >
                </b-form-checkbox>
                <div v-if="timetable.plan[day][hour].locked">
                  <b-form-select
                    v-model="selected"
                    :options="[]"
                  />
                </div>
                <div v-else>
                  <b>{{ timetable.plan[day][hour].lessonName }}</b>

                  <p class="mb-0">
                    <span
                      v-for="teacher in timetable.plan[day][hour].teachers"
                      :key="teacher">
                      {{ teachers[teacher].name }}
                    </span>
                  </p>
                </div>
              </template>
              <template v-if="type === 'teacher'">
                <b>{{ timetable.plan[day][hour].className }}</b>

                <p class="mb-0">
                  {{ timetable.plan[day][hour].lessonName }}
                </p>
              </template>
            </div>
            <div v-else>
              <b-button
                class="mt-3"
                variant="primary"
                @click="fillEmpty(day, hour)">
                {{ '_lp.timetable.lock-lesson' | translate }}
              </b-button>
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

    return {
      days: new Array(5),
      hours: new Array(maxHours),
      loading: false,
      teachers: lessonPlanning[this.$route.params.id].teachers,
    };
  },
  methods: {
    async fillEmpty(hour, day) {
      this.loading = true;
      this.timetable.plan[day][hour] = { locked: true };

      await new Promise((resolve) => setTimeout(resolve));
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
