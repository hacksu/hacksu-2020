<template>
    <div class="edit-notes-page">
        <div class="page-header">
            <h1>Meeting Notes Editor</h1>
            <p class="subtitle">Create and manage meeting notes for HacKSU</p>
        </div>
        <div class="notes-grid">
            <div class="note-card" v-for="(note, j) in notesToDisplay" :key="note.id">
                <div class="note-form">
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" v-model="note.title" class="form-input" placeholder="Enter note title..." />
                    </div>

                    <div class="form-group">
                        <label>Date</label>
                        <input type="date" v-model="note.date" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Note Content (Markdown)</label>
                        <textarea v-model="note.notesMD" class="form-textarea" 
                            placeholder="Write your notes here using Markdown..."></textarea>
                    </div>

                    <div class="button-group">
                        <button class="btn btn-primary" @click="update(note, j)">
                            {{j === 0 ? "Add New Note" : "Save Changes"}}
                            <span v-if="confirmation.has(j)" class="confirmation-icon">✓</span>
                        </button>
                        <button class="btn btn-danger" v-if="j !== 0" @click="remove(note, j)">
                            Delete Note
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive, computed } from "vue";
import { remult } from "remult";
import { Note } from "../../db/entities.js";

const notes = ref([]);
const confirmation = ref(new Set());
const repo = remult.repo(Note);
const newNote = reactive(repo.create());

const notesToDisplay = computed(() => [newNote, ...notes.value]);

let unsubscribe;
onMounted(async () => {
    try {
        unsubscribe = repo.liveQuery({
            orderBy: { date: "desc" }
        }).subscribe(info => {
            notes.value = info.applyChanges(notes.value);
            console.log('Notes loaded:', notes.value);
        });
    } catch (error) {
        console.error('Error loading notes:', error);
    }
});

onUnmounted(() => {
    if (unsubscribe) {
        unsubscribe();
    }
});

const update = async (note, j) => {
    try {
        let update;
        if (j === 0) {
            update = await repo.insert(newNote);
        } else {
            update = await repo.update(note.id, note);
        }
        
        confirmation.value.add(j);
        setTimeout(() => confirmation.value.delete(j), 3000);
        
        if (j === 0) {
            Object.assign(newNote, repo.create());
        }
    } catch (error) {
        console.error('Error updating note:', error);
        alert("Error updating note: " + error.message);
    }
};

const remove = async (note, j) => {
    if (confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)) {
        try {
            await repo.delete(note);
        } catch (error) {
            console.error('Error deleting note:', error);
            alert("Error deleting note: " + error.message);
        }
    }
};
</script>

<style scoped lang="scss">
.edit-notes-page {
    padding: 2rem;
    background-color: #f5f5f5;
    min-height: 100vh;
    color: #2c3e50;
}

.page-header {
    max-width: 1200px;
    margin: 0 auto 2rem;
    padding-top: 80px;
    text-align: center;

    h1 {
        color: #2c3e50;
        font-size: 2.5rem;
        margin: 0 0 0.5rem;
    }

    .subtitle {
        color: #666;
        font-size: 1.1rem;
        margin: 0;
    }
}

.notes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.note-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.note-form {
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

    &::placeholder {
        color: #999;
    }
}

.form-textarea {
    @extend .form-input;
    min-height: 200px;
    resize: vertical;
    font-family: inherit;
    line-height: 1.5;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

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
    flex: 2;

    &:hover {
        background-color: #2980b9;
    }
}

.btn-danger {
    background-color: #e74c3c;
    color: white;
    flex: 1;

    &:hover {
        background-color: #c0392b;
    }
}

.confirmation-icon {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
}
</style>
