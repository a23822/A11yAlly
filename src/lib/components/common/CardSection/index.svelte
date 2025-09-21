<script lang="ts">
  let {
    children,
    title = null,
    class: className = "",
    innerClassName = "",
    innerStyle = "",
    ...rest
  } = $props();
</script>

<div {...rest} class="section {className}">
  <div class="section_inner {innerClassName}" style={innerStyle}>
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
    position: relative;
    background-color: rgba(var(--color-bg-card), 1);
    padding: 16px;
    border-radius: 8px;
    &:before {
      content: "";
      position: absolute;
      inset: 0;
      border: 1px solid rgba(var(--color-border-default), 1);
      border-radius: inherit;
      pointer-events: none;
    }
  }
  .section_title_area {
    padding-bottom: 12px;
    line-height: 21px;
    .title {
      font-size: 1.8rem;
    }
  }
</style>
