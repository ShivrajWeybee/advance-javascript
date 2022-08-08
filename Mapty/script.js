'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const allWorkouts = document.querySelector('.all_workouts');
const deleteAll = document.querySelector('.delete-all');
const sort = document.querySelector('.sort');

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coord, distance, duration) {
        this.coord = coord;
        this.distance = distance; //km
        this.duration = duration; //min
    }

    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coord, distance, duration, cadence) {
        super(coord, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(coord, distance, duration, elevationGain) {
        super(coord, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}



class App {

    #map;
    #mapEvent;
    #workout = [];
    #marker = [];
    #mapZoomLevel = 13;

    constructor() {
        this._getPosition();
        this._getLocalStorage(this.#workout);
        form.addEventListener('submit', this._newWorkout.bind(this));
        form.classList.add('hidden');
        inputType.addEventListener('change', this._toggleElevationField.bind(this));
        containerWorkouts.addEventListener('click',this. _moveToPopup.bind(this));
        deleteAll.addEventListener('click', this._deleteAll.bind(this));
        sort.addEventListener('click', this._sortWorkout.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),function(){alert('Can not get your location');}
            );
        }
    }

    _loadMap(position) {
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        
        const coords = [latitude, longitude];
        
        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
        
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        
        this.#map.on('click', this._showForm.bind(this));

        this.#workout.forEach(work => {
            this._renderWorkoutMarker(work);
        })
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _hideForm() {
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
    }

    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;

        e.preventDefault();

        if(type==='running') {
            const cadence = +inputCadence.value;
            if(!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)){
                return alert('Input is must be positive');
            }
            workout = new Running([lat, lng], distance, duration, cadence);
        }

        if(type==='cycling') {
            const elevation = +inputElevation.value;
            if(!validInputs(distance, duration, elevation) || !allPositive(distance, duration)){
                return alert('Input is must be positive');
            }
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        this.#workout.push(workout);
        this.#marker.push(workout);
        this._hideForm(workout);
        this._renderWorkoutMarker(workout);
        this._renderWorkout(workout);
        this._setLocalStorage();
    }

    _renderWorkoutMarker(workout) {
        const marker = L.marker(workout.coord)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️ ' : '🚴‍♀️ '}${workout.description}`)
            .openPopup();

        this.#marker.push({id:workout.id, marker:marker});
    }

    _removeWorkoutMarker(a) {
        map.removeLayer(a);
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <div class="title">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="edit-delete">
                    <i class="fa-regular fa-pen-to-square workout-edit"></i>
                    <i class="fa-regular fa-trash-can workout-delete"></i>
                </div>
            </div>
            <div class="workout__details">
                <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
                <span class="workout__value distance">${workout.distance}</span>
                <input type="text" class="distance-edit hidden">
                <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value duration">${workout.duration}</span>
                <input type="text" class="duration-edit hidden">
                <span class="workout__unit">min</span>
            </div>
        `
        if(workout.type === 'running'){
            html +=
            `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value pace">${workout.pace.toFixed(1)}</span>
                    <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">🦶🏼</span>
                    <span class="workout__value cadence">${workout.cadence}</span>
                    <input type="text" class="cadence-edit hidden">
                    <span class="workout__unit">spm</span>
                </div>
            </li>
            `
        }
        if(workout.type === 'cycling') {
            html +=
            `
                <div class="workout__details">
                    <span class="workout__icon">⚡️</span>
                    <span class="workout__value speed">${workout.speed.toFixed(1)}</span>
                    <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                    <span class="workout__icon">⛰</span>
                    <span class="workout__value elevation">${workout.elevationGain}</span>
                    <input type="text" class="elevation-edit hidden">
                    <span class="workout__unit">m</span>
                </div>
            </li>
            `
        }

        allWorkouts.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(e) {
        const workoutEl = e.target.closest('.workout');

        if(e.target.classList.contains('workout-delete')) {
            this._deleteWorkout(e);
            return;
        }

        if(e.target.classList.contains('workout-edit')) {
            this._toggleEditWorkout(e);
            workoutEl.addEventListener('keydown', this._editWorkout.bind(this));
            return;
        }

        if(!workoutEl) return;

        const workout = this.#workout.find(work => work.id === workoutEl.dataset.id);

        this.#map.setView(workout.coord, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1,
            }
        });
    }

    _setLocalStorage() {
        localStorage.setItem(`workouts`, JSON.stringify(this.#workout));
    }

    _getLocalStorage(s) {
        const data = JSON.parse(localStorage.getItem('workouts'));

        if(!data) return;

        this.#workout = data;

        this.#workout.forEach(work => {
            this._renderWorkout(work);
        })
    }

    reset() {
        localStorage.clear();
        location.reload();
    }

    _deleteWorkout(e) {
        const workoutDel = e.target.closest('.workout');

        if(!workoutDel) return;

        const delElement = this.#workout.find(work => work.id === workoutDel.dataset.id);

        const delElementIndex = this.#workout.findIndex(work => work.id === workoutDel.dataset.id);
        this.#workout.splice(delElementIndex, 1);

        const delMarkerIndex = this.#marker.findIndex(marker => e.id = marker.id);
        this.#marker.splice(delMarkerIndex, 1);

        this._setLocalStorage();
        const data = JSON.parse(localStorage.getItem('workouts'));

        if(!data) return;

        this.#workout = data;

        workoutDel.remove();
    }

    _deleteAll(e) {
        const sure = confirm('Are you sure to delete all workout ?');

        if(!sure) return;

        localStorage.clear();
        thi._setLocalStorage();
        this.#workout.splice(0, this.#workout.length);
    }

    _editWorkout(e) {
        if(e.key !== 'Enter') return;

        const element = e.target.closest('.workout');

        const oldDistance = element.querySelector('.distance')
        const newDistance = element.querySelector('.distance-edit');
        const oldDuration = element.querySelector('.duration');
        const newDuration = element.querySelector('.duration-edit');
        const oldPace = element.querySelector('.pace');
        const oldCadence = element.querySelector('.cadence');
        const newCadence = element.querySelector('.cadence-edit');
        const oldSpeed = element.querySelector('.speed');
        const oldElevation = element.querySelector('.elevation');
        const newElevation = element.querySelector('.elevation-edit');

        oldDistance.textContent = newDistance.value;
        oldDuration.textContent = newDuration.value;

        if(element.classList.contains('workout--running')) {
            oldPace.textContent = newDuration.value / newDistance.value;

            oldCadence.textContent = newCadence.value;

            oldCadence.classList.remove('hidden');
            newCadence.classList.add('hidden');
        }
        if(element.classList.contains('workout--cycling')) {
            oldSpeed.textContent = newDistance.value / (newDuration.value / 60);

            oldElevation.textContent = newElevation.value;

            oldElevation.classList.remove('hidden');
            newElevation.classList.add('hidden');
        }

        oldDistance.classList.remove('hidden');
        newDistance.classList.add('hidden');

        oldDuration.classList.remove('hidden');
        newDuration.classList.add('hidden');

        this.#workout.forEach(work => {
            if(work.id !== element.dataset.id) return;

            work.distance = newDistance.value;
            work.duration = newDuration.value;

            if(work.type === 'running') {
                work.pace = newDuration.value / newDistance.value;
                work.cadence = newCadence.value;
            }
            if(work.type === 'cycling') {
                work.speed = newDistance.value / (newDuration.value/60);
                work.elevationGain = newElevation.value;
            }
        })

        this._setLocalStorage();
    }

    _toggleEditWorkout(e) {
        const workoutEdit = e.target.closest('.workout');
        if(!workoutEdit) return;

        const distanceEdit = workoutEdit.querySelector('.distance-edit');
        const durationEdit = workoutEdit.querySelector('.duration-edit');
        const cadenceEdit = workoutEdit.querySelector('.cadence-edit');
        const elevationEdit = workoutEdit.querySelector('.elevation-edit');
        const value = workoutEdit.querySelectorAll('.workout__value');

        value.forEach(i => i.classList.toggle('hidden'));
        distanceEdit.classList.toggle('hidden');
        durationEdit.classList.toggle('hidden');

        if(workoutEdit.classList.contains('workout--running')) {
            cadenceEdit.classList.toggle('hidden');
        }

        if(workoutEdit.classList.contains('workout--cycling')) {
            elevationEdit.classList.toggle('hidden');
        }
    }

    _sortWorkout(e) {
        const selectedSort = sort.options[sort.selectedIndex].value;
        let sortedWorkout;
        if(selectedSort === 'distance-h-l') {
            sortedWorkout = this.#workout.sort((a,b) => a.distance - b.distance);
        }
        else if(selectedSort === 'distance-l-h') {
            sortedWorkout = this.#workout.sort((a,b) => b.distance - a.distance);
        }
        else if(selectedSort === 'duration-h-l') {
            sortedWorkout = this.#workout.sort((a,b) => a.duration - b.duration);
        }
        else {
            sortedWorkout = this.#workout.sort((a,b) => b.duration - a.duration);
        }

        if(!selectedSort) return;

        allWorkouts.innerHTML = '';
        sortedWorkout.forEach(i => this._renderWorkout(i));
    }
}

const app = new App();