import { useEffect, useMemo, useState } from 'react';
import type { GlucoseMeasurement, MeasurementContext, Units } from '../types';
import { CONTEXT_OPTIONS } from '../types';
import { displayToMmol, formatValue, mmolToDisplay, unitLabel } from '../utils/units';
import { toLocalInputValue } from '../utils/date';

export interface MeasurementFormValues {
  value_mmol: number;
  measured_at: string;
  context: MeasurementContext;
  comment: string | null;
}

interface Props {
  units: Units;
  initial?: GlucoseMeasurement | null;
  demoMode?: boolean;
  submitting?: boolean;
  onSubmit: (values: MeasurementFormValues) => void;
  onCancel?: () => void;
}

/** Валидация диапазона значений в отображаемых единицах. */
function validRange(units: Units): { min: number; max: number } {
  return units === 'mmol' ? { min: 0.5, max: 35 } : { min: 9, max: 630 };
}

export function MeasurementForm({
  units,
  initial,
  demoMode = false,
  submitting = false,
  onSubmit,
  onCancel,
}: Props) {
  const [localUnits, setLocalUnits] = useState<Units>(units);
  const [valueStr, setValueStr] = useState('');
  const [dt, setDt] = useState(toLocalInputValue(new Date()));
  const [context, setContext] = useState<MeasurementContext>('fasting');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Инициализация при редактировании записи
  useEffect(() => {
    if (initial) {
      setLocalUnits(units);
      setValueStr(formatValue(initial.value_mmol, units));
      setDt(toLocalInputValue(new Date(initial.measured_at)));
      setContext(initial.context);
      setComment(initial.comment ?? '');
    } else {
      setValueStr('');
      setDt(toLocalInputValue(new Date()));
      setContext('fasting');
      setComment('');
    }
    setError(null);
  }, [initial, units]);

  // При переключении единиц пересчитываем ОТОБРАЖАЕМОЕ число (исходные данные не меняются)
  const handleUnitsChange = (next: Units) => {
    const parsed = parseFloat(valueStr.replace(',', '.'));
    if (!Number.isNaN(parsed)) {
      const mmol = displayToMmol(parsed, localUnits);
      setValueStr(formatValue(mmol, next));
    }
    setLocalUnits(next);
  };

  const step = localUnits === 'mmol' ? '0.1' : '1';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(valueStr.replace(',', '.'));
    const { min, max } = validRange(localUnits);
    if (Number.isNaN(parsed)) {
      setError('Введите значение глюкозы числом.');
      return;
    }
    if (parsed < min || parsed > max) {
      setError(`Значение должно быть в диапазоне ${min}–${max} ${unitLabel(localUnits)}.`);
      return;
    }
    if (!dt) {
      setError('Укажите дату и время измерения.');
      return;
    }
    const when = new Date(dt);
    if (Number.isNaN(when.getTime())) {
      setError('Некорректная дата или время.');
      return;
    }
    if (when.getTime() > Date.now() + 60_000) {
      setError('Нельзя добавить измерение из будущего.');
      return;
    }
    setError(null);
    onSubmit({
      value_mmol: Number(displayToMmol(parsed, localUnits).toFixed(2)),
      measured_at: when.toISOString(),
      context,
      comment: comment.trim() ? comment.trim() : null,
    });
    if (!initial) setValueStr('');
  };

  const preview = useMemo(() => {
    const p = parseFloat(valueStr.replace(',', '.'));
    if (Number.isNaN(p)) return null;
    const mmol = displayToMmol(p, localUnits);
    return formatValue(mmol, localUnits === 'mmol' ? 'mgdl' : 'mmol') + ' ' + unitLabel(localUnits === 'mmol' ? 'mgdl' : 'mmol');
  }, [valueStr, localUnits]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {demoMode && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Демо-режим: записи сохраняются только в этом браузере и не являются
          реальными медицинскими данными.
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="m-value">
            Значение глюкозы
          </label>
          <input
            id="m-value"
            inputMode="decimal"
            className="input"
            type="number"
            step={step}
            placeholder={localUnits === 'mmol' ? 'Например: 5.6' : 'Например: 101'}
            value={valueStr}
            onChange={(e) => setValueStr(e.target.value)}
            autoFocus={!initial}
          />
          {preview && (
            <p className="mt-1 text-xs text-slate-400">≈ {preview}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="m-units">
            Единицы измерения
          </label>
          <select
            id="m-units"
            className="input"
            value={localUnits}
            onChange={(e) => handleUnitsChange(e.target.value as Units)}
          >
            <option value="mmol">ммоль/л</option>
            <option value="mgdl">мг/дл</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="m-date">
            Дата
          </label>
          <input
            id="m-date"
            type="date"
            className="input"
            max={toLocalInputValue(new Date()).slice(0, 10)}
            value={dt.slice(0, 10)}
            onChange={(e) => setDt(`${e.target.value}T${dt.slice(11) || '00:00'}`)}
          />
        </div>
        <div>
          <label className="label" htmlFor="m-time">
            Время
          </label>
          <input
            id="m-time"
            type="time"
            className="input"
            value={dt.slice(11)}
            onChange={(e) => setDt(`${dt.slice(0, 10)}T${e.target.value}`)}
          />
        </div>
        <div>
          <label className="label" htmlFor="m-context">
            Контекст измерения
          </label>
          <select
            id="m-context"
            className="input"
            value={context}
            onChange={(e) => setContext(e.target.value as MeasurementContext)}
          >
            {CONTEXT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="m-comment">
            Комментарий (необязательно)
          </label>
          <input
            id="m-comment"
            className="input"
            maxLength={200}
            placeholder="Например: после прогулки"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Отмена
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Сохранение…' : initial ? 'Сохранить изменения' : 'Добавить измерение'}
        </button>
      </div>
    </form>
  );
}
