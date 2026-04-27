function padNumber(value: number) {
  return String(value).padStart(2, "0");
}

function parseTimeInput(value: string) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return { hours, minutes };
}

export function toLocalDateTimeString(value: Date) {
  return [
    `${value.getFullYear()}-${padNumber(value.getMonth() + 1)}-${padNumber(value.getDate())}`,
    `${padNumber(value.getHours())}:${padNumber(value.getMinutes())}:${padNumber(value.getSeconds())}`,
  ].join("T");
}

export function buildLocalDateTimeFromTimeInput(time: string, reference: Date) {
  const parsedTime = parseTimeInput(time);

  if (!parsedTime) {
    return null;
  }

  const nextDate = new Date(reference);
  nextDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
  return toLocalDateTimeString(nextDate);
}

export function localDateTimeToDate(value: string) {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value.trim());

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  const seconds = Number(match[6] ?? 0);

  if (
    [year, month, day, hours, minutes, seconds].some(
      (part) => !Number.isInteger(part),
    )
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hours, minutes, seconds, 0);
}

export function formatLocalDateTime(
  value: string,
  locale = "ka-GE",
  options?: Intl.DateTimeFormatOptions,
) {
  const date = localDateTimeToDate(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    ...options,
  }).format(date);
}

export function formatLocalTime(value: string) {
  const directTimeMatch = /^(\d{1,2}:\d{2})/.exec(value.trim());

  if (directTimeMatch) {
    return directTimeMatch[1];
  }

  const date = localDateTimeToDate(value);

  if (!date) {
    return value;
  }

  return `${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}
