import { fireEvent, render } from '@testing-library/react-native'
import { PersonTagInput } from '../PersonTagInput'

describe('PersonTagInput', () => {
  it('adds a person on submit and prevents duplicate tags', () => {
    const onChange = jest.fn()
    const screen = render(<PersonTagInput persons={['A']} onChange={onChange} />)
    const input = screen.getByPlaceholderText('人物名を入力')

    fireEvent.changeText(input, 'B')
    fireEvent(input, 'submitEditing')
    expect(onChange).toHaveBeenCalledWith(['A', 'B'])

    fireEvent.changeText(input, 'A')
    fireEvent(input, 'submitEditing')
    expect(onChange).toHaveBeenCalledTimes(1)
  })
})
