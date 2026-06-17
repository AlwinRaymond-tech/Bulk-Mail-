export function createSubmissionGuard() {
  let isLocked = false;

  return {
    begin() {
      if (isLocked) {
        return false;
      }

      isLocked = true;
      return true;
    },
    end() {
      isLocked = false;
    },
    isLocked() {
      return isLocked;
    },
  };
}
