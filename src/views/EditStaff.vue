<template>
    <div class="edit-staff-page">
        <div class="page-header">
            <h1>Staff Page Editor</h1>
        </div>
        <div class="staff-grid">
            <div class="staff-card" v-for="staff, j in staffToDisplay" :key="staff.id">
                <div class="staff-form">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" v-model="staff.name" class="form-input" />
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Grad Term</label>
                            <select v-model="staff.gradTerm" class="form-select">
                                <option value="Spring">Spring</option>
                                <option value="Summer">Summer</option>
                                <option value="Fall">Fall</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Grad Year</label>
                            <input type="number" v-model="staff.gradYear" class="form-input" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Github Username</label>
                        <input type="string" v-model="staff.github" class="form-input" />
                    </div>

                    <div class="form-group">
                        <label>Website</label>
                        <input type="string" v-model="staff.link" class="form-input" placeholder="[will link to Github by default]" />
                    </div>

                    <div class="form-group">
                        <label>Photo</label>
                        <div class="photo-input">
                            <input type="string" v-model="staff.photo" disabled class="form-input" placeholder="[uses Github pic by default]" />
                            <button v-if="staff.photo" @click="staff.photo=''" class="btn btn-icon">❌</button>
                            <button @click="upload(j)" class="btn btn-primary" title="Upload photo">Upload</button>
                        </div>
                        <input type="file" ref="fileUpload" style="display:none" accept="image/jpeg,image/png" />
                    </div>

                    <div class="form-group">
                        <label>Titles</label>
                        <div class="titles-container">
                            <input type="text" v-for="title, i in staff.titles" v-model="staff.titles[i]" :key="i" class="form-input" />
                            <input type="text" v-model="newTitles[j]" placeholder="Add title..." class="form-input" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="staff.isCurrent">
                            <span>Current Leadership</span>
                        </label>
                    </div>

                    <div class="button-group">
                        <button class="btn btn-primary" @click="update(staff, j)">
                            {{j==0 ? "Add New Staff" : "Save Changes"}}{{ confirmation.has(j) ? ' ✅' : "" }}
                        </button>
                        <button class="btn btn-danger" v-if="j!==0" @click="remove(staff, j)">
                            Delete Staff
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, reactive, computed } from "vue";
import { remult } from "remult";
import { StaffMember } from "../../db/entities.js";

const staffMembers = ref([]);
const confirmation = ref(new Set());
const newTitles = ref([]);

watch(staffMembers, (newValue) => {
    while (newTitles.value.length < newValue.length + 1) {
        newTitles.value.push("");
    }
});

const repo = remult.repo(StaffMember);
const newStaff = reactive(repo.create());

const staffToDisplay = computed(() => [newStaff, ...staffMembers.value]);

let unsubscribe;
onMounted(async () => {
    try {
        unsubscribe = repo.liveQuery({
            orderBy: { gradYear: "desc" }
        }).subscribe(info => {
            staffMembers.value = info.applyChanges(staffMembers.value);
            console.log('Staff loaded:', staffMembers.value);
        });
    } catch (error) {
        console.error('Error loading staff:', error);
    }
});

onUnmounted(() => {
    if (unsubscribe) {
        unsubscribe();
    }
});

const update = async (staff, j) => {
    try {
        const newTitle = newTitles.value[j].trim();
        const titles = (staff.titles || []).concat(newTitle ? [newTitle] : [])
            .filter(t => t.trim());
        
        let update;
        if (j === 0) {
            update = await repo.insert({...newStaff, titles});
        } else {
            update = await repo.update(staff.id, { ...staff, titles });
        }
        
        newTitles.value[j] = "";
        confirmation.value.add(j);
        setTimeout(() => confirmation.value.delete(j), 3000);
        
        if (j === 0) {
            Object.assign(newStaff, repo.create());
        }
    } catch (error) {
        console.error('Error updating staff:', error);
        alert("Error updating staff: " + error.message);
    }
};

const remove = (staff, j) => {
    if(confirm("really delete " + staff.name+"?")){
        repo.delete(staff);
    }
}

const fileUpload = ref(null);
watch(fileUpload, (inputs) => {
    for (let i=0; i<inputs.length; ++i){
        inputs[i].onchange = () => {
            const data = new FormData();
            data.append("photo", inputs[i].files[0]);
            fetch("/staff-photo-upload", { method: "POST", body: data })
                .then(async (res) => {
                    const path = await res.text();
                    staffToDisplay.value[i].photo = path;
                });
        };
    }
}, { deep: true });
const upload = (i) => {
    if (fileUpload.value[i]){
        fileUpload.value[i].click();
    }
};

</script>

<style scoped lang="scss">
.edit-staff-page {
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

.staff-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.staff-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.staff-form {
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

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.form-input, .form-select {
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

    &:disabled {
        background-color: #f5f5f5;
        color: #666;
    }
}

.photo-input {
    display: flex;
    gap: 0.5rem;
    align-items: center;

    .form-input {
        flex: 1;
    }
}

.titles-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    color: #2c3e50;

    input[type="checkbox"] {
        width: 18px;
        height: 18px;
    }
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

.btn-icon {
    padding: 0.75rem;
    background: none;
    border: 1px solid #ddd;
    border-radius: 6px;

    &:hover {
        background-color: #f5f5f5;
    }
}
</style>
