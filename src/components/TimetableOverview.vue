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
        class="mdi mdi-timetable h4 ml-3 d-flex text-white align-items-center mb-0 h-100"
        v-b-tooltip.hover
      />
    </div>

    <b-overlay
      class="d-flex flex-column"
      style="max-height: 100%;"
      :show="generating">
      <div class="py-1 px-5 d-flex border-bottom">
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
          @click="reset()"
          class="mt-3"
          v-if="plans"
          variant="danger">
          {{ '_lp.timetable.reset' | translate }}
        </b-button>
      </div>

      <div class="overflow-auto" v-if="plans">
        <lp-timetable
          :key="`${activeView}-${index}`"
          :timetable="plan"
          :type="activeView === 0 ? 'class' : 'teacher'"
          v-for="(plan, index) in plans[activeView === 0 ? 'classes' : 'teachers']"
        />
      </div>
      <div class="text-center p-5" v-else>
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
    async generateNewPlan() {
      // ensure to show loading screen
      this.generating = true;

      // get new timetable
      await new Promise((resolve) => setTimeout(resolve, 200));
      this.tg.update();
      this.setPlans();

      this.generating = false;
    },
    /**
     * Update the display arrays
     */
    setPlans() {
      // map the plans to arrays, so they can be better displayed
      this.plans = {
        classes: [],
        teachers: [],
      };
      Object.keys(this.tg.classes).forEach((classId) => {
        this.plans.classes.push({
          name: this.tg.classes[classId].name,
          plan: this.tg[classId],
        });
      });

      Object.keys(this.tg.teachers).forEach((teacherId) => {
        this.plans.teachers.push({
          name: this.tg.teachers[teacherId].name,
          plan: this.tg[teacherId],
        });
      });
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
