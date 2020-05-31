<template>
  <div
    class="timetable-overview"
    :class="{
      'active': active
    }">
    <div
      class="toggle"
      @click="toggle()">
      <i
        :title="$t(`_lp.timetable.create`)"
        class="mb-0 ml-3 text-white mdi mdi-timetable h4 d-flex align-items-center h-100"
        v-b-tooltip.hover
      />
    </div>

    <b-modal id="error-modal">
      <template v-slot:modal-title>
        {{ '_lp.timetable.error.title' | translate }}
      </template>
      <div class="text-center d-block">
        {{ '_lp.timetable.error.invalid' | translate }}
      </div>
    </b-modal>

    <b-modal id="manual-error-modal">
      <template v-slot:modal-title>
        {{ '_lp.timetable.error.title' | translate }}
      </template>
      <div class="text-center d-block">
        {{ '_lp.timetable.error.manual' | translate }}
      </div>
    </b-modal>

    <b-overlay
      class="d-flex flex-column"
      style="max-height: 100%;"
      :show="generating">
      <div class="px-5 py-1 d-flex border-bottom">
        <div
          :class="{ 'bg-primary text-light': activeView === 0}"
          @click="activeView = 0"
          class="p-3">
          {{ '_lp.class.multiple' | translate }}
        </div>
        <div
          :class="{ 'bg-primary text-light': activeView === 1}"
          @click="activeView = 1"
          class="p-3">
          {{ '_lp.teachers.multiple' | translate }}
        </div>

        <span class="mx-auto" />

        <b-button
          @click="printPlans()"
          class="mt-3 mr-3"
          v-if="plans"
          variant="primary">
          {{ '_lp.timetable.print' | translate }}
        </b-button>

        <b-button
          @click="reset()"
          class="mt-3"
          v-if="plans"
          variant="danger">
          {{ '_lp.timetable.reset' | translate }}
        </b-button>
      </div>

      <div class="overflow-auto timetable-container" style="min-height: 100%" v-if="plans">
        <template v-if="!reloading">
          <lp-timetable
            :key="`${activeView}-${index}`"
            :timetable="plan"
            :type="activeView === 0 ? 'class' : 'teacher'"
            v-for="(plan, index) in plans[activeView === 0 ? 'classes' : 'teachers']"
            @update="generateNewPlan($event)"
          />
        </template>
      </div>
      <div class="p-5 text-center" v-else>
        <h4>{{ '_lp.timetable.missing' | translate }}</h4>

        <b-button
          class="mt-3"
          variant="primary"
          @click="generateNewPlan()">
          {{ '_lp.timetable.create' | translate }}
        </b-button>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import lessonPlanning from '../LessonPlanning';
import Timetable from './Timetable';
import TimetableGenerator from '../TimetableGenerator';

export default {
  name: 'TimetableOverview',
  components: {
    'lp-timetable': Timetable,
  },
  data() {
    return {
      active: false,
      activeView: 0,
      generating: false,
      plans: null,
      reloading: false,
      tg: null,
    };
  },
  methods: {
    /**
     * Toggle the timetable panel and genewrate new plans, when active state is true.
     */
    toggle() {
      this.active = !this.active;
      if (this.active) {
        this.tg = new TimetableGenerator(this.$route.params.id);
        // if a timetable was generated before, show it directly
        if (lessonPlanning[this.$route.params.id].timetable) {
          this.setPlans();
        }
      }
    },
    /**
     * Reset current configuration and create a new timetable
     */
    reset() {
      delete lessonPlanning[this.$route.params.id].timetable;
      this.tg = new TimetableGenerator(this.$route.params.id);
      this.generateNewPlan();
    },
    /**
     * Generate a new plan, with the current configuration
     */
    async generateNewPlan($event) {
      let skipUpdate = false;

      // get new timetabl
      try {
        if ($event) {
          const { lessonId, previousLesson, dayIndex, hourIndex } = $event;

          // if a lesson was locked, assign it
          if (lessonId) {
            if (previousLesson === lessonId) {
              skipUpdate = true;
            }

            // update original timetable with new lesson
            this.tg.lockLesson(lessonId, { dayIndex, hourIndex });
          } else {
            this.tg.revertLesson(previousLesson, { dayIndex, hourIndex });
          }
        }
        // do not update timetable, when the same lesson is selected as before
        if (!skipUpdate) {
          // ensure to show loading screen
          this.generating = true;
          await new Promise((resolve) => setTimeout(resolve, 100));
          this.tg.update();
          this.setPlans();
        }
      } catch (ex) {
        console.error(ex.message);

        // show message
        if ($event) {
          const { previousLesson, dayIndex, hourIndex } = $event;
          // revert previous configuration
          this.tg.assignLesson(previousLesson, { dayIndex, hourIndex });
          this.tg.update();
          this.setPlans();

          this.$bvModal.show('manual-error-modal');
        } else {
          this.$bvModal.show('error-modal');
        }
      }

      // hide overlay and force update of tables
      this.reloading = true;
      await new Promise((resolve) => setTimeout(resolve, 0));
      this.reloading = false;
      this.generating = false;
    },
    /**
     * Update the display arrays
     */
    setPlans() {
      const school = this.tg.school;
      // map the plans to arrays, so they can be better displayed
      this.plans = {
        classes: [],
        teachers: [],
      };
      Object.keys(school.classes).forEach((classId) => {
        this.plans.classes.push({
          classId,
          name: school.classes[classId].name,
          plan: this.tg[classId],
        });
      });

      Object.keys(school.teachers).forEach((teacherId) => {
        this.plans.teachers.push({
          teacherId,
          name: school.teachers[teacherId].name,
          plan: this.tg.getTeacherPlan(teacherId),
        });
      });
    },
    printPlans() {
      document.getElementById('print').innerHTML = this.$el.querySelectorAll('.timetable-container')[0].innerHTML;
      window.print();
    },
  },
};
</script>

<style lang="scss" scoped>
  .timetable-overview {
    position: fixed;
    width: calc(100% - 16.66667%);
    z-index: 10;
    left: 100%;
    top: 66px;
    height: calc(100% - 66px);
    background-color: white;
    box-shadow: -2px 0 9px 0 grey;

    .toggle {
      position: absolute;
      height: 50px;
      width: 50px;
      background-color: #880e4f;
      top: 20px;
      left: -30px;
    }

    .toggle:hover {
      left: -50px;
    }

    // active state
    &.active {
      left: 16.66667%;

      .toggle {
        left: -30px;
      }
    }

    // bind animations
    &, .toggle {
      transition: 0.3s left ease-out;
    }
  }
</style>
