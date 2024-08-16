import type { EventMessage } from "../../../constants/events.messages";
import { BlockChainStore } from "../../../store";

export function BlockChainMessage(message: EventMessage) {
  return (target: any, nameMethod: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      let data; // Объявляем переменную

      // Сохраняем ссылку на функцию для последующего использования
      const executionMethod = originalMethod.bind(this, ...args);

      BlockChainStore.on(message, (eventData) => {
        data = eventData; // Присваиваем значение переменной

        // Вызываем декорируемый метод с аргументами
        const result = executionMethod({ ...args, msg: data });

        return result;
      });
    };
  };
}
