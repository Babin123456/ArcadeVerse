/**
 * Timeline Controller
 * Interactive scrub bar and state inspection renderer.
 * Author: Babin Bid (@Babin123456)
 */

class TimelineController {
  constructor(scrubberContainer, stateInspectorContainer, diffContainer) {
    this.scrubberContainer = scrubberContainer;
    this.inspectorContainer = stateInspectorContainer;
    this.diffContainer = diffContainer;
    this.activeIndex = 0;
  }

  render(snapshots) {
    this.scrubberContainer.innerHTML = "";

    if (!snapshots || snapshots.length === 0) {
      this.scrubberContainer.innerHTML = `<span style="color:#64748b;">No checkpoints recorded yet.</span>`;
      this.inspectorContainer.textContent = "{}";
      this.diffContainer.innerHTML = "";
      return;
    }

    if (this.activeIndex >= snapshots.length) {
      this.activeIndex = snapshots.length - 1;
    }

    // Scrub Bar Track
    const track = document.createElement("div");
    track.className = "timeline-track";

    snapshots.forEach((snap, idx) => {
      const node = document.createElement("div");
      node.className = `timeline-node ${idx === this.activeIndex ? "active" : ""}`;
      node.title = `${snap.label} (${snap.score} pts)`;
      node.innerHTML = `<span>#${idx + 1}</span>`;

      node.addEventListener("click", () => {
        this.activeIndex = idx;
        this.render(snapshots);
      });

      track.appendChild(node);
    });

    this.scrubberContainer.appendChild(track);

    // Active Snapshot Inspection
    const current = snapshots[this.activeIndex];
    this.inspectorContainer.textContent = JSON.stringify(current.state, null, 2);

    // Diff with previous snapshot
    if (this.activeIndex > 0) {
      const prev = snapshots[this.activeIndex - 1];
      const diff = StorageDiffEngine.compareStates(prev.state, current.state);
      this.renderDiff(diff, prev.label, current.label);
    } else {
      this.diffContainer.innerHTML = `<div style="color: #64748b; font-size: 0.8rem;">Initial checkpoint (no prior state to diff against).</div>`;
    }
  }

  renderDiff(diff, prevLabel, currentLabel) {
    let html = `<div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 8px;">Mutations from [${prevLabel}] to [${currentLabel}]:</div>`;
    
    if (diff.modified.length === 0 && diff.added.length === 0 && diff.removed.length === 0) {
      html += `<div style="color: #64748b; font-size: 0.8rem;">No state mutations detected between these checkpoints.</div>`;
    } else {
      html += `<ul style="list-style: none; display: flex; flex-direction: column; gap: 4px; font-size: 0.78rem; font-family: monospace;">`;
      diff.modified.forEach(m => {
        html += `<li style="color: #38bdf8;">• <strong>${m.key}</strong>: <span style="color:#ef4444;">${JSON.stringify(m.from)}</span> → <span style="color:#10b981;">${JSON.stringify(m.to)}</span></li>`;
      });
      diff.added.forEach(a => {
        html += `<li style="color: #10b981;">+ [ADD] <strong>${a.key}</strong>: ${JSON.stringify(a.value)}</li>`;
      });
      diff.removed.forEach(r => {
        html += `<li style="color: #ef4444;">- [DEL] <strong>${r.key}</strong></li>`;
      });
      html += `</ul>`;
    }

    this.diffContainer.innerHTML = html;
  }
}

window.TimelineController = TimelineController;
