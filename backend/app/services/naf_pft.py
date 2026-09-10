from .data_input import get_user_input
from .core_cal import compute_naf_pft
from .display import print_result

def main():
    user_data = get_user_input()
    result = compute_naf_pft(user_data)
    print_result(result)

if __name__ == "__main__":
    main()

