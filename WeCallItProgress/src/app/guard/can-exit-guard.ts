import { CanDeactivateFn } from '@angular/router';

export const canExitGuard: CanDeactivateFn<any> = (component) => {
   if (component && component.canDeactivate) {
    return component.canDeactivate();
  }
   return true;
};
