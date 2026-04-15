import { EquipmentTypes, type LabelAndEquipmentProps } from "./listCheckerProps";

export const SAMPLE_OBJECT_ARRAY: LabelAndEquipmentProps[] = [
  {
    id: 1,
    label: 'Select Audio System',
    equipment: [
      {
        id: 1,
        isChecked: true,
        type: EquipmentTypes.SPEAKER,
        name: 'RCF ART 745A',
      },
      {
        id: 2,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'Yamaha DZR15',
      },
      {
        id: 3,
        isChecked: true,
        type: EquipmentTypes.SPEAKER,
        name: 'QSC K12',
      },
      {
        id: 4,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'RCF ART 745A',
      },
      {
        id: 6,
        isChecked: false,
        type: EquipmentTypes.MIXER,
        name: 'Allen & Heath SQ5',
      },
    ],
  },

  {
    id: 2,
    label: 'Lighting System',
    equipment: [
      {
        id: 1,
        isChecked: true,
        type: EquipmentTypes.SPEAKER,
        name: 'BEAM 295',
      },
      {
        id: 2,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'Yamaha DZR15',
      },
      {
        id: 3,
        isChecked: true,
        type: EquipmentTypes.SPEAKER,
        name: 'QSC K12',
      },
      {
        id: 4,
        isChecked: false,
        type: EquipmentTypes.SPEAKER,
        name: 'RCF ART 745A',
      },
      {
        id: 5,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Mipro 311B',
      },
      {
        id: 6,
        isChecked: false,
        type: EquipmentTypes.MIXER,
        name: 'Allen & Heath SQ5',
      },
      {
        id: 7,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Sennheiser Wired Mics',
      },
    ],
  },
  {
    id: 3,
    label: 'Vocal Microphones',
    equipment: [
      {
        id: 1,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Sennheiser Wired Mics',
      },
      {
        id: 2,
        isChecked: false,
        type: EquipmentTypes.MICROPHONE,
        name: 'Mipro 311B',
      },
    ],
  },
]
