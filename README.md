# lesson-planning

Easy handling of school, teacher and lesson metadata, for easy creations of timetables.

## You want to try it?
Have a look at: [Lesson Planning](https://tschuck.github.io/lesson-planning)

Download sample file: [Demo School](https://raw.githubusercontent.com/Tschuck/lesson-planning/master/docs/DemoSchool.json)

## Features
- [x] handle plans for several schools
- [x] manage classes, lessons and teachers
- [x] handle cross references between class lessons
- [x] manage availablity of teachers
- [x] create automatic generated lesson plans for all classes and teachers
- [x] manually lock lessons at specific time slot in plan
- [x] print view for class and teacher plans

## Have a look
### Class Management
![Class Management](https://raw.githubusercontent.com/Tschuck/lesson-planning/master/docs//img1.png)

### Teacher Management
![Teacher Management](https://raw.githubusercontent.com/Tschuck/lesson-planning/master/docs/img2.png)

## Automatic plan generation
![Automatic plan generation](https://raw.githubusercontent.com/Tschuck/lesson-planning/master/docs/img3.png)

# Tech
## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

## Release the package to github-pages

```bash
yarn build
git subtree push --prefix dist origin gh-pages
```
