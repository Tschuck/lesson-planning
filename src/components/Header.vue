<template>
  <b-navbar toggleable="lg" type="dark" variant="primary">
    <b-navbar-brand class="d-flex align-items-center">
      <router-link to="/">
        <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
          width="40px" height="40px" viewBox="0 0 512.000000 512.000000"
          preserveAspectRatio="xMidYMid meet">
          <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
          fill="#ffffff" stroke="none">
          <path d="M2470 4136 c-71 -19 -2444 -857 -2457 -868 -7 -6 -13 -21 -13 -35 0
          -19 9 -28 42 -43 24 -10 583 -229 1243 -485 1087 -424 1203 -467 1245 -463 27
          3 489 178 1175 445 l1130 441 3 -551 2 -551 -36 -30 c-97 -79 -96 -223 0 -303
          l37 -30 -15 -37 c-45 -108 -102 -395 -94 -476 17 -175 241 -236 352 -97 27 34
          31 48 34 115 5 110 -49 364 -102 483 -5 10 1 20 19 29 14 8 39 34 55 59 25 37
          30 54 30 106 0 51 -5 69 -28 104 -15 23 -38 48 -50 57 l-22 15 0 590 c0 424 3
          594 11 608 8 12 9 23 2 36 -7 12 -384 149 -1237 450 -674 238 -1239 435 -1254
          438 -15 3 -47 -1 -72 -7z"/>
          <path d="M782 2358 c4 -348 6 -377 26 -438 139 -420 772 -737 1579 -789 399
          -26 902 70 1260 239 305 145 500 327 577 538 19 53 20 84 24 441 3 314 1 383
          -10 378 -522 -209 -1696 -657 -1721 -657 -21 0 -360 127 -882 330 -465 182
          -849 330 -852 330 -3 0 -3 -168 -1 -372z"/>
          </g>
        </svg>
      </router-link>
      <div class="text-white ml-3">
        {{ '_lp.title' | translate }}
      </div>
    </b-navbar-brand>
    <slot />
  </b-navbar>
</template>

<script>
export default {
  name: 'Header',
};
</script>
