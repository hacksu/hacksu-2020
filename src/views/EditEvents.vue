<template>
    <div class="edit-events-page">
        <div class="page-header">
            <h1>Events Editor</h1>
        </div>
        <div class="events-grid">
            <div class="event-card" v-for="(event, j) in eventsToDisplay" :key="event.id" @input="edited.add(j)">
                <div class="cover-photo-preview"
                    :style="event.photo ? {backgroundImage: `url(${event.photo})`} : {backgroundColor: '#2c3e50'}">
                    <button @click="() => choosePhoto(j)" class="photo-btn add-photo" v-if="!event.photo">
                        +
                    </button>
                    <button @click="event.photo = ''; edited.add(j)" class="photo-btn remove-photo" v-if="event.photo">
                        ×
                    </button>
                    <input type="file" ref="fileUpload" style="display:none" accept="image/jpeg,image/png" />
                </div>

                <div class="event-form">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" v-model="event.title" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" v-model="event.date" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Description (Markdown)</label>
                        <textarea v-model="event.descriptionMD" class="form-textarea"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Presenter</label>
                        <input type="text" v-model="event.presenter" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Link</label>
                        <input type="text" v-model="event.link" class="form-input" />
                    </div>

                    <div class="button-group">
                        <button class="btn btn-primary" @click="update(event, j)">
                            {{(j==0 ? "Add New Event" : "Save Changes") + (edited.has(j) ? " ❗" : "")}}
                            {{ confirmation.has(j) ? ' ✅' : "" }}
                        </button>
                        <button class="btn btn-danger" v-if="j!==0" @click="remove(event, j)">
                            Delete Event
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <dialog ref="cropModal" class="crop-modal">
            <div class="crop-container">
                <h2>Crop Image</h2>
                <cropper
                    ref="cropperComponent"
                    v-if="imagePreview"
                    class="cropper"
                    :src="imagePreview"
                    :stencil-props="{ aspectRatio: 2.5 }"
                ></cropper>
                <button class="btn btn-primary" @click="() => cropDoneCallback()">Crop & Save</button>
            </div>
        </dialog>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { remult } from "remult";
import { Event } from "../../db/entities.js";

import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const events = ref([]);
const confirmation = ref(new Set());
const edited = ref(new Set());
const repo = remult.repo(Event);
const newEvent = ref(repo.create());

const eventsToDisplay = computed(() => [newEvent.value, ...events.value]);

let unsubscribe;
onMounted(async () => {
    try {
        unsubscribe = repo.liveQuery({
            orderBy: { date: "desc" }
        }).subscribe(info => {
            events.value = info.items;
            console.log('Events loaded:', events.value);
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
});

onUnmounted(() => {
    if (unsubscribe) {
        unsubscribe();
    }
});

const update = (event, j) => {
    let update;
    if (j == 0){
        update = repo.insert(newEvent.value);
    } else {
        update = repo.update(event.id, event);
    }
    update.then(() => {
        confirmation.value.add(j);
        edited.value.delete(j);
        setTimeout(() => confirmation.value.delete(j), 3000);
        if (j == 0){
            newEvent.value = repo.create();
        }
    }).catch((e) => {
        alert("Error updating event: " + e);
        alert("e: " + e);
    })
};

const remove = (event, j) => {
    if(confirm("really delete " + event.title + "?")){
        repo.delete(event);
    }
}

const cropModal = ref(null);
const cropperComponent = ref(null);
const imagePreview = ref("");
const cropDoneCallback = ref(null);

function crop(url, resultCallback){
    imagePreview.value = url;
    cropModal.value?.showModal();
    cropDoneCallback.value = () => {
        cropDoneCallback.value = null;
        imagePreview.value = "";
        cropperComponent.value.getResult().canvas.toBlob(resultCallback);
        cropModal.value.close();
    };
}

const uploadPhoto = async (photoFile, name) => {
    const data = new FormData();
    data.append("photo", photoFile, name);
    return await fetch("/event-photo-upload", { method: "POST", body: data })
        .then(async (res) => {
            const path = await res.text();
            return path;
        });
};

const fileUpload = ref(null);
watch(fileUpload, (inputs) => {
    for (let i = 0; i<inputs.length; ++i){
        inputs[i].onchange = () => {
            const fileName = inputs[i].files[0].name;
            const url = URL.createObjectURL(inputs[i].files[0]);
            crop(url, async (result) => {
                eventsToDisplay.value[i].photo = await uploadPhoto(
                    result, fileName
                );
            });
        };
    }
}, { deep: true });

const choosePhoto = (i) => {
    fileUpload.value[i]?.click();
};
</script>

<style scoped lang="scss">
.edit-events-page {
    padding: 2rem;
    background-color: #f5f5f5;
    min-height: 100vh;
    color: #2c3e50;
}

.page-header {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding-top: 80px;

    h1 {
        color: #2c3e50;
        font-size: 2.5rem;
        margin: 0;
    }
}

.events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.event-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cover-photo-preview {
    height: 200px;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.photo-btn {
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 50%;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.2s, background-color 0.2s;
    font-size: 24px;
    line-height: 1;

    &:hover {
        transform: scale(1.1);
        background: white;
    }

    &.remove-photo {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: rgba(231, 76, 60, 0.9);
        color: white;
        font-size: 28px;

        &:hover {
            background: #e74c3c;
        }
    }

    &.add-photo {
        font-size: 32px;
        font-weight: 300;
    }
}

.event-form {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        color: #2c3e50;
        font-weight: 500;
    }
}

.form-input {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.2s;
    color: #2c3e50;
    background-color: white;

    &:focus {
        outline: none;
        border-color: #3498db;
    }
}

.form-textarea {
    @extend .form-input;
    min-height: 120px;
    resize: vertical;
    font-family: inherit;
}

.button-group {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;

    &:hover {
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
        opacity: 0.9;
    }
}

.btn-primary {
    background-color: #3498db;
    color: white;

    &:hover {
        background-color: #2980b9;
    }
}

.btn-danger {
    background-color: #e74c3c;
    color: white;

    &:hover {
        background-color: #c0392b;
    }
}

.crop-modal {
    border: none;
    border-radius: 12px;
    padding: 0;
    background: white;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

    &::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }
}

.crop-container {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-width: 500px;

    h2 {
        color: #2c3e50;
        margin: 0;
    }
}

.cropper {
    height: 400px;
    background: #f5f5f5;
}
</style>
