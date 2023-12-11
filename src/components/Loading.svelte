<script lang="ts">
    import {isLoading} from"../lib/stores/userStore";
</script>

<div class="waiting-room" style="display: {$isLoading ? 'flex' : 'none'};">
    <div class="loader"></div>
    <span>正在尋找配對...</span>
</div>

<style>
    .waiting-room {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
    }

    .loader {
        border: 5px solid #f3f3f3; /* Light grey */
        border-top: 5px solid #3498db; /* Blue */
        border-radius: 50%;
        width: 50px;
        height: 50px;
        margin-bottom: 5px;
        animation: spin 2s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>