/**
 * State Storage Diff Engine
 * Compares two checkpoint JSON states and identifies state mutations.
 * Author: Babin Bid (@Babin123456)
 */

class StorageDiffEngine {
  static compareStates(prevState, nextState) {
    const diff = {
      added: [],
      removed: [],
      modified: [],
      unchanged: []
    };

    const prevKeys = Object.keys(prevState || {});
    const nextKeys = Object.keys(nextState || {});
    const allKeys = Array.from(new Set([...prevKeys, ...nextKeys]));

    allKeys.forEach(key => {
      const prevVal = prevState ? prevState[key] : undefined;
      const nextVal = nextState ? nextState[key] : undefined;

      if (prevVal === undefined && nextVal !== undefined) {
        diff.added.push({ key, value: nextVal });
      } else if (prevVal !== undefined && nextVal === undefined) {
        diff.removed.push({ key, value: prevVal });
      } else if (JSON.stringify(prevVal) !== JSON.stringify(nextVal)) {
        diff.modified.push({ key, from: prevVal, to: nextVal });
      } else {
        diff.unchanged.push({ key, value: nextVal });
      }
    });

    return diff;
  }
}

window.StorageDiffEngine = StorageDiffEngine;
