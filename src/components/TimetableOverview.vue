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

    <div class="d-flex flex-column" style="max-height: 100%;">
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
      </div>

      <div class="overflow-auto" v-if="plans">
        <lp-timetable
          :key="`${activeView}-${index}`"
          :timetable="plan"
          :type="activeView === 0 ? 'class' : 'teacher'"
          v-for="(plan, index) in plans[activeView === 0 ? 'classes' : 'teachers']"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Timetable from './Timetable';
import TimetableGenerator from '../TimetableGenerator';

export default {
  name: 'Schools',
  components: {
    'lp-timetable': Timetable,
  },
  data() {
    return {
      active: false,
      activeView: 0,
      plans: null,
    };
  },
  methods: {
    /**
     * Toggle the timetable panel and genewrate new plans, when active state is true.
     */
    toggle() {
      this.active = !this.active;

      if (this.active) {
        this.plans = (new TimetableGenerator(this.$route.params.id)).generate();
      } else {
        this.plans = null;
      }

      console.log(this.plans);
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
