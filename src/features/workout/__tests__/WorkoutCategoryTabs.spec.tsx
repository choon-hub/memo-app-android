import { fireEvent, render } from '@testing-library/react-native'
import { WorkoutCategoryTabs } from '../WorkoutCategoryTabs'

describe('WorkoutCategoryTabs', () => {
  it('emits the selected workout category', () => {
    const onChange = jest.fn()
    const screen = render(<WorkoutCategoryTabs value="chest" onChange={onChange} />)

    fireEvent.press(screen.getByText('脚'))
    expect(onChange).toHaveBeenCalledWith('legs')
  })
})
