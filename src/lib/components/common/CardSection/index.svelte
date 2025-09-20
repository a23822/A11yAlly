<script lang="ts">
    let { children, title = null, class: className = '', ...rest } = $props();
</script>

<div {...rest} class="section {className}">
    <div class="section_inner">
        {#if title}
            <h2 class="section_title_area">
                <div class="title">{title}</div>
            </h2>
        {/if}
        {@render children?.()}
    </div>
</div>

<style lang="scss">
    .section {
        margin: 0 auto 24px;
        padding: 12px;
        max-width: var(--layout-max-width);
    }
    .section_inner {
        background-color: var(--color-bg-card);
        padding: 16px;
        border-radius: 8px;
        border: 1px solid var(--color-border-default);
    }
    .section_title_area {
        padding-bottom: 12px;
        line-height: 21px;
        .title {
            font-size: 1.8rem;
        }
    }
</style>
