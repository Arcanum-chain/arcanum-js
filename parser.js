const yaml = require("js-yaml");
const fs = require("fs");

const envs = {};

function parseYamlConfig(filePath) {
  try {
    // Читаем файл конфигурации
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Парсим YAML-контент
    const config = yaml.load(fileContent);

    // Проверяем, является ли результат объектом
    if (typeof config !== "object") {
      throw new Error("Ошибка: Неверный формат YAML-файла. Ожидается объект.");
    }

    saveEnvs(config);

    return config;
  } catch (error) {
    console.error("Ошибка при парсинге YAML-файла:", error);
    throw error;
  }
}

function saveEnvs(config) {
  try {
    Object.entries(config).map(([key, value]) => {
      if (typeof value === "object") {
        return saveEnvs(value);
      } else {
        envs[key] = value;
      }
    });
  } catch (e) {
    throw e;
  }
}

// Пример использования
const configFilePath = "config.yml"; // Замените 'config.yml' на путь к вашему YAML-файлу

try {
  const config = parseYamlConfig(configFilePath);
  console.log("Конфигурация:", envs);
} catch (error) {
  console.error("Ошибка при получении конфигурации:", error);
}
