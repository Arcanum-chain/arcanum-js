import cron from "node-cron";

export function Cron(regex: string) {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const executionMethod = originalMethod.bind(this, ...args);
      cron.schedule(regex, () => {
        const result = executionMethod(...args);

        return result;
      });
    };
  };
}
