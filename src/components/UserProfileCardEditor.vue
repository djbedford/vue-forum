<template>
  <div class="profile-card">
    <vee-form @submit="save">
      <p class="text-center avatar-edit">
        <label for="avatar">
          <app-avatar-img
            :src="activeUser.avatar"
            :alt="`${user.name} profile picture`"
            class="avatar-xlarge img-update"
          />
          <div class="avatar-upload-overlay">
            <app-spinner v-if="uploadingImage" :colour="white" />
            <font-awesome
              v-else
              icon="camera"
              size="3x"
              :style="{ color: 'white', opacity: '0.8' }"
            />
          </div>
          <input
            v-show="false"
            type="file"
            id="avatar"
            accept="image/*"
            @change="handleAvatarUpload"
          />
        </label>
      </p>

      <user-profile-card-editor-random-avatar
        @hit="activeUser.avatar = $event"
      />

      <app-form-field
        v-model="activeUser.username"
        name="username"
        placeholder="Username"
        :rules="`required|unique:users,username,${user.username}`"
      />

      <app-form-field
        v-model="activeUser.name"
        name="name"
        rules="required"
        placeholder="Full Name"
      />

      <app-form-field
        as="textarea"
        name="bio"
        label="Bio"
        v-model="activeUser.bio"
        placeholder="Write a few words about yourself."
      />

      <div class="stats">
        <span>{{ user.postsCount }} posts</span>
        <span>{{ user.threadsCount }} threads</span>
      </div>

      <hr />

      <app-form-field
        v-model="activeUser.website"
        name="website"
        label="Website"
        autocomplete="off"
        rules="url"
      />

      <app-form-field
        v-model="activeUser.email"
        name="email"
        label="Email"
        type="email"
        :rules="`required|email|unique:users,email,${user.email}`"
      />

      <app-form-field
        v-model="activeUser.location"
        name="location"
        label="Location"
        list="locations"
        @mouseenter="loadLocationOptions"
      />
      <datalist id="locations">
        <option
          v-for="location in locationOptions"
          :value="location.name.common"
          :key="location.name.common"
        />
      </datalist>

      <div class="btn-group space-between">
        <button type="reset" class="btn-ghost" @click.prevent="cancel">
          Cancel
        </button>
        <button type="submit" class="btn-blue">Save</button>
      </div>
    </vee-form>
    <user-profile-card-editor-reauthenticate
      v-model="needsReauth"
      @success="onReauthenticated"
      @fail="onReauthenticatedFail"
    />
  </div>
</template>

<script>
import { mapActions } from "pinia";
import { useAuthStore } from "../stores/auth";
import { useUsersStore } from "../stores/users";
import useNotifications from "@/composables/useNotifications";
import UserProfileCardEditorRandomAvatar from "@/components/UserProfileCardEditorRandomAvatar.vue";
import UserProfileCardEditorReauthenticate from "@/components/UserProfileCardEditorReauthenticate.vue";

export default {
  props: {
    user: {
      required: true,
      type: Object,
    },
  },
  components: {
    UserProfileCardEditorRandomAvatar,
    UserProfileCardEditorReauthenticate,
  },
  setup() {
    const { addNotification } = useNotifications();

    return { addNotification };
  },
  data() {
    return {
      uploadingImage: false,
      activeUser: { ...this.user },
      locationOptions: [],
      needsReauth: false,
    };
  },
  methods: {
    ...mapActions(useAuthStore, ["uploadAvatar", "updateEmail"]),
    ...mapActions(useUsersStore, ["updateUser"]),
    async loadLocationOptions() {
      if (this.locationOptions.length) {
        return;
      }

      const response = await fetch("https://restcountries.com/v3/all");

      this.locationOptions = await response.json();
    },
    async handleAvatarUpload(event) {
      this.uploadingImage = true;
      const file = event.target.files[0];
      const uploadedImage = await this.uploadAvatar({ file });
      this.activeUser.avatar = uploadedImage || this.activeUser.avatar;
      this.uploadingImage = false;
    },
    async handleRandomAvatarUpload() {
      const randomAvatarGenerated =
        this.activeUser.avatar.startsWith("https://pixabay");

      if (randomAvatarGenerated) {
        const image = await fetch(this.activeUser.avatar);
        const blob = await image.blob();

        this.activeUser.avatar = await this.uploadAvatar({
          file: blob,
          filename: "random",
        });
      }
    },
    async onReauthenticated() {
      await this.updateEmail({
        email: this.activeUser.email,
      });

      this.saveUserData();
    },
    async onReauthenticatedFail() {
      this.addNotification({
        message: "Error updating user.",
        type: "error",
        timeout: 3000,
      });
      this.$router.push({ name: "Profile" });
    },
    async saveUserData() {
      await this.updateUser({
        ...this.activeUser,
        threads: this.activeUser.threadIds,
      });

      this.$router.push({ name: "Profile" });
      this.addNotification({
        message: "Successfully updated user.",
        timeout: 3000,
      });
    },
    async save() {
      await this.handleRandomAvatarUpload();

      const emailChanged = this.activeUser.email !== this.user.email;

      if (emailChanged) {
        this.needsReauth = true;
      } else {
        this.saveUserData();
      }
    },
    cancel() {
      this.$router.push({ name: "Profile" });
    },
  },
};
</script>

<style scoped>
.avatar-edit {
  position: relative;
}

.avatar-edit .avatar-upload-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
